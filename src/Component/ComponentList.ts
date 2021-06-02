import Component, {ComponentConstructor} from "@/Component";
import {isArray, isFunction, isMatch} from 'lodash';
import EventEmitter from "@/EventEmitter";
import PropertySync, {PropertySyncEvents} from "@/PropertySync";
import {check, Constructor, instanceOf} from "validation-kit";
import ComponentFactory from "@/Component/ComponentFactory";
import Mozel, {Collection} from "mozel";

export class ComponentAddedEvent<T extends Component> {
	constructor(public component: T) {}
}
export class ComponentRemovedEvent<T extends Component> {
	constructor(public component: T) {}
}

class ComponentListEvents<C extends Component> extends PropertySyncEvents<C[]> {
	// Using $register for generic type definition on EventEmitter
	added = this.$register(new EventEmitter<ComponentAddedEvent<C>>(ComponentAddedEvent), ComponentAddedEvent.name);
	removed = this.$register(new EventEmitter<ComponentRemovedEvent<C>>(ComponentRemovedEvent), ComponentRemovedEvent.name);
}
type ComponentModel<C extends Component> = C['model'];

export default class ComponentList<C extends Component> extends PropertySync<Collection<ComponentModel<C>>, C[]>{
	ComponentModelClass:Constructor<ComponentModel<C>>;
	ComponentClass:ComponentConstructor<C>;
	factory:ComponentFactory;
	currentCollection?:Collection<ComponentModel<C>>;
	parent:Component;

	get current() {
		return this._current ? this._current : [];
	}

	addedListener = (model:unknown) => {
		const $model = check<ComponentModel<C>>(model, instanceOf(this.ComponentModelClass), this.ComponentModelClass.name, 'model');
		const component = this.factory.resolve<C>($model, this.ComponentClass, true);

		if(component && !this.has(component)) {
			this.add(component);
		}
	}
	removedListener = (model:unknown) => {
		const $model = check<ComponentModel<C>>(model, instanceOf(this.ComponentModelClass), this.ComponentModelClass.name, 'model');
		const component = this.factory.registry.byGid($model.gid);
		if(component instanceof this.ComponentClass) {
			this.remove(component);
		}
	}

	events = new ComponentListEvents<C>();

	constructor(parent:Component, watchModel:Mozel, path:string, PropertyType:Constructor<ComponentModel<C>>, SyncType:ComponentConstructor<C>, factory:ComponentFactory) {
		super(watchModel, path, Collection, SyncType as any); // TS: we override isSyncType
		this.ComponentModelClass = PropertyType;
		this.ComponentClass = SyncType;
		this.factory = factory;
		this.parent = parent;
	}

	isSyncType(value: unknown): value is C[] {
		return isArray(value) && !value.find(item => !(item instanceof this.SyncType));
	}

	protected syncValue(collection?:Collection<ComponentModel<C>>) {
		this.clear();

		// Remove listeners from current collection
		if(this.currentCollection) {
			this.currentCollection.removeAddedListener(this.addedListener);
			this.currentCollection.removeRemovedListener(this.removedListener);
		}
		this.currentCollection = collection;
		if(!collection) return []; // because of this, `current` is always defined

		// Add listeners to new collection
		collection.onAdded(this.addedListener);
		collection.onRemoved(this.removedListener);

		// Resolve components for each of the models
		const components = collection.map((model:ComponentModel<C>) =>
			this.factory.resolve<C>(model, this.ComponentClass, true));

		// Add one by one to trigger events on ComponentList
		components.forEach(component => this.add(component));

		return components;
	}

	clear() {
		if(!this.current) return;
		for(let i = this.current.length-1; i >= 0; i--) {
			const item = this.current[i];
			if(!this.isReference) item.setParent(undefined);
			this.current.splice(i, 1);
			this.events.removed.fire(new ComponentRemovedEvent(item));
		}
	}

	add(component:C) {
		if(this.has(component)) {
			// already in list, don't add again
			return;
		}
		if(!this.isReference) component.setParent(this.parent);
		this.current.push(component);
		this.events.added.fire(new ComponentAddedEvent(component));
	}

	has(component:C) {
		return !!this.current.find(item => item === component);
	}

	getIndex(index:number) {
		return this.current[index];
	}

	remove(component:C|C[]|((component:C)=>boolean)):number {
		if(isArray(component)) {
			return component.reduce((sum:number, item:C) => this.remove(item), 0);
		}
		const check = isFunction(component) ? component : (item:Component) => item === component;
		let count = 0;
		for(let i = this.current.length-1; i >= 0; i--) {
			let item = this.current[i];
			if(!this.isReference) item.setParent(undefined);
			if(check(item)) {
				this.current.splice(i, 1);
				this.events.removed.fire(new ComponentRemovedEvent(item));
			}
		}
		return count;
	}

	each(callback:(component:C)=>void) {
		this.current.forEach(callback);
	}

	find(predicate:((value:C)=>boolean)|Record<string,unknown>) {
		const check = isFunction(predicate)
			? predicate
			: (candidate:C) => isMatch(candidate, predicate);

		for (const component of this.current.values()) {
			if(check(component)) {
				return component;
			}
		}
	}

	count() {
		return this.current.length;
	}

	destroy() {
		this.current.forEach(component => component.destroy());
	}
}
