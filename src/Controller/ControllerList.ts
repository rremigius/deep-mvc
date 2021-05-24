import Controller, {ControllerConstructor} from "@/Controller";
import {isArray, isFunction, isMatch} from 'lodash';
import EventEmitter from "@/EventEmitter";
import PropertySync, {PropertySyncEvents} from "@/PropertySync";
import {check, Constructor, instanceOf} from "validation-kit";
import ControllerFactory from "@/Controller/ControllerFactory";
import Mozel, {Collection} from "mozel";

export class ControllerAddedEvent<T extends Controller> {
	constructor(public controller: T) {}
}
export class ControllerRemovedEvent<T extends Controller> {
	constructor(public controller: T) {}
}

class ControllerListEvents<C extends Controller> extends PropertySyncEvents<C[]> {
	// Using $register for generic type definition on EventEmitter
	added = this.$register(new EventEmitter<ControllerAddedEvent<C>>(ControllerAddedEvent), ControllerAddedEvent.name);
	removed = this.$register(new EventEmitter<ControllerRemovedEvent<C>>(ControllerRemovedEvent), ControllerRemovedEvent.name);
}
type ControllerModel<C extends Controller> = C['model'];

export default class ControllerList<C extends Controller> extends PropertySync<Collection<ControllerModel<C>>, C[]>{
	ControllerModelClass:Constructor<ControllerModel<C>>;
	ControllerClass:ControllerConstructor<C>;
	factory:ControllerFactory;
	current:C[] = [];
	currentCollection?:Collection<ControllerModel<C>>;
	parent:Controller;

	addedListener = (model:unknown) => {
		const $model = check<ControllerModel<C>>(model, instanceOf(this.ControllerModelClass), this.ControllerModelClass.name, 'model');
		const controller = this.factory.resolve<C>($model, this.ControllerClass, true);

		if(controller && !this.has(controller)) {
			this.add(controller);
		}
	}
	removedListener = (model:unknown) => {
		const $model = check<ControllerModel<C>>(model, instanceOf(this.ControllerModelClass), this.ControllerModelClass.name, 'model');
		const controller = this.factory.registry.byGid($model.gid);
		if(controller instanceof this.ControllerClass) {
			this.remove(controller);
		}
	}

	events = new ControllerListEvents<C>();

	constructor(parent:Controller, watchModel:Mozel, path:string, PropertyType:Constructor<ControllerModel<C>>, SyncType:ControllerConstructor<C>, factory:ControllerFactory) {
		super(watchModel, path, Collection, SyncType as any); // TS: we override isSyncType
		this.ControllerModelClass = PropertyType;
		this.ControllerClass = SyncType;
		this.factory = factory;
		this.parent = parent;
	}

	isSyncType(value: unknown): value is C[] {
		return isArray(value) && !value.find(item => !(item instanceof this.SyncType));
	}

	protected syncValue(collection?:Collection<ControllerModel<C>>) {
		this.clear();

		// Remove listeners from current collection
		if(this.currentCollection) {
			this.currentCollection.removeAddedListener(this.addedListener);
			this.currentCollection.removeRemovedListener(this.removedListener);
		}
		this.currentCollection = collection;
		if(!collection) return [];

		// Add listeners to new collection
		collection.onAdded(this.addedListener);
		collection.onRemoved(this.removedListener);

		// Resolve controllers for each of the models
		const controllers = collection.map((model:ControllerModel<C>) =>
			this.factory.resolve<C>(model, this.ControllerClass, true));

		// Add one by one to trigger events on ControllerList
		controllers.forEach(controller => this.add(controller));

		return controllers;
	}

	clear() {
		if(!this.current) return;
		for(let i = this.current.length-1; i >= 0; i--) {
			const item = this.current[i];
			item.setParent(undefined);
			this.current.splice(i, 1);
			this.events.removed.fire(new ControllerRemovedEvent(item));
		}
	}

	add(controller:C) {
		if(this.has(controller)) {
			// already in list, don't add again
			return;
		}
		controller.setParent(this.parent);
		this.current.push(controller);
		this.events.added.fire(new ControllerAddedEvent(controller));
	}

	has(controller:C) {
		return !!this.current.find(item => item === controller);
	}

	getIndex(index:number) {
		return this.current[index];
	}

	remove(controller:C|C[]|((controller:C)=>boolean)):number {
		if(isArray(controller)) {
			return controller.reduce((sum:number, item:C) => this.remove(item), 0);
		}
		const check = isFunction(controller) ? controller : (item:Controller) => item === controller;
		let count = 0;
		for(let i = this.current.length-1; i >= 0; i--) {
			let item = this.current[i];
			item.setParent(undefined);
			if(check(item)) {
				this.current.splice(i, 1);
				this.events.removed.fire(new ControllerRemovedEvent(item));
			}
		}
		return count;
	}

	each(callback:(controller:C)=>void) {
		this.current.forEach(callback);
	}

	find(predicate:((value:C)=>boolean)|Record<string,unknown>) {
		const check = isFunction(predicate)
			? predicate
			: (candidate:C) => isMatch(candidate, predicate);

		for (const controller of this.current.values()) {
			if(check(controller)) {
				return controller;
			}
		}
	}

	count() {
		return this.current.length;
	}

	destroy() {
		this.current.forEach(controller => controller.destroy());
	}
}
