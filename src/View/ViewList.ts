import {isArray, isFunction, isMatch} from 'lodash';
import PropertySync, {PropertySyncEvents} from "@/PropertySync";
import {check, Constructor, instanceOf} from "validation-kit";
import ViewFactory from "@/View/ViewFactory";
import Mozel, {Collection} from "mozel";
import View, {ViewConstructor} from "../View";
import EventEmitter from "../EventEmitter";

export class ViewAddedEvent<T extends View> {
	constructor(public view: T) {}
}
export class ViewRemovedEvent<T extends View> {
	constructor(public view: T) {}
}

class ViewListEvents<C extends View> extends PropertySyncEvents<C[]>{
	// Using $register for generic type definition on EventEmitter
	added = this.$register(new EventEmitter<ViewAddedEvent<C>>(ViewAddedEvent), ViewAddedEvent.name);
	removed = this.$register(new EventEmitter<ViewRemovedEvent<C>>(ViewRemovedEvent), ViewRemovedEvent.name);
}
type ViewModel<C extends View> = C['model'];

export default class ViewList<C extends View> extends PropertySync<Collection<ViewModel<C>>, C[]>{
	ViewModelClass:Constructor<ViewModel<C>>;
	ViewClass:ViewConstructor<C>;
	factory:ViewFactory;
	current:C[] = [];
	currentCollection?:Collection<ViewModel<C>>;
	parent:View;

	addedListener = (model:unknown) => {
		const $model = check<ViewModel<C>>(model, instanceOf(this.ViewModelClass), this.ViewModelClass.name, 'model');
		const view = this.factory.resolve<C>($model, this.ViewClass, true);

		if(view && !this.has(view)) {
			this.add(view);
		}
	}
	removedListener = (model:unknown) => {
		const $model = check<ViewModel<C>>(model, instanceOf(this.ViewModelClass), this.ViewModelClass.name, 'model');
		const view = this.factory.registry.byGid($model.gid);
		if(view instanceof this.ViewClass) {
			this.remove(view);
		}
	}

	events = new ViewListEvents<C>();

	constructor(parent:View, watchModel:Mozel, path:string, PropertyType:Constructor<ViewModel<C>>, SyncType:ViewConstructor<C>, factory:ViewFactory) {
		super(watchModel, path, Collection, SyncType as any); // TS: we override isSyncType
		this.ViewModelClass = PropertyType;
		this.ViewClass = SyncType;
		this.factory = factory;
		this.parent = parent;
	}

	isSyncType(value: unknown): value is C[] {
		return isArray(value) && !value.find(item => !(item instanceof this.SyncType));
	}

	protected syncValue(collection?:Collection<ViewModel<C>>) {
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

		// Resolve views for each of the models
		const views = collection.map((model:ViewModel<C>) =>
			this.factory.resolve<C>(model, this.ViewClass, true));

		// Add one by one to trigger events on ViewList
		views.forEach(view => this.add(view));

		return views;
	}

	clear() {
		if(!this.current) return;
		for(let i = this.current.length-1; i >= 0; i--) {
			const item = this.current[i];
			item.setParent(undefined);
			this.current.splice(i, 1);
			this.events.removed.fire(new ViewRemovedEvent(item));
		}
	}

	add(view:C) {
		if(this.has(view)) {
			// already in list, don't add again
			return;
		}
		view.setParent(this.parent);
		this.current.push(view);
		this.events.added.fire(new ViewAddedEvent(view));
	}

	has(view:C) {
		return !!this.current.find(item => item === view);
	}

	getIndex(index:number) {
		return this.current[index];
	}

	remove(view:C|C[]|((view:C)=>boolean)):number {
		if(isArray(view)) {
			return view.reduce((sum:number, item:C) => this.remove(item), 0);
		}
		const check = isFunction(view) ? view : (item:View) => item === view;
		let count = 0;
		for(let i = this.current.length-1; i >= 0; i--) {
			let item = this.current[i];
			item.setParent(undefined);
			if(check(item)) {
				this.current.splice(i, 1);
				this.events.removed.fire(new ViewRemovedEvent(item));
			}
		}
		return count;
	}

	each(callback:(view:C)=>void) {
		this.current.forEach(callback);
	}

	find(predicate:((value:C)=>boolean)|Record<string,unknown>) {
		const check = isFunction(predicate)
			? predicate
			: (candidate:C) => isMatch(candidate, predicate);

		for (const view of this.current.values()) {
			if(check(view)) {
				return view;
			}
		}
	}

	count() {
		return this.current.length;
	}

	destroy() {
		this.current.forEach(view => view.destroy());
	}
}
