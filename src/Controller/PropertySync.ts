import Controller from "@/Controller";
import Mozel, {immediate} from "mozel";
import {isString} from 'lodash';
import {callback, Events} from "@/EventEmitter";
import Property, {PropertyType, PropertyValue} from "mozel/dist/Property";
import {check, Constructor, instanceOf} from "validation-kit";

export class ValueChangeEvent<T> {
	constructor(
		public path:string,
		public isReference:boolean,
		public current?:T,
		public old?:T) {}
}

export class PropertySyncEvents<T> extends Events {
	changed = this.$event<ValueChangeEvent<T>>(ValueChangeEvent);
}

/**
 * Watches a Model path for changes, constructs something based on the new value when it changes and fires
 * an event with the new and old constructs.
 */
export default class PropertySync<P extends PropertyValue,T> {
	parent?:Controller;
	current?:T;

	events = new PropertySyncEvents<T>();

	model:Mozel;
	path:string;
	readonly PropertyType:PropertyType;
	readonly SyncType:Constructor<T>;

	watching:boolean = false;
	resolveReferences:boolean = false;
	isReference:boolean = false;

	constructor(parent:Controller, watchModel:Mozel, path:string, PropertyType:PropertyType, SyncType:Constructor<T>) {
		this.model = watchModel;
		this.path = path;
		this.PropertyType = PropertyType;
		this.SyncType = SyncType;
		this.parent = parent;
	}

	isPropertyType(value:unknown):value is P {
		return Property.checkType(value, this.PropertyType);
	}
	
	isSyncType(value:unknown):value is T {
		return value instanceof this.syncValue
	}

	startWatching() {
		if(this.watching) {
			return;
		}
		this.watching = true;
		this.model.$watch(this.path,(newValue, oldValue, path) => {
			this.syncFromModel(newValue, path);
		}, {immediate});
	}

	sync() {
		const current = this.model.$path(this.path);
		this.syncFromModel(current, this.path);
	}

	syncFromModel(value:PropertyValue, changePath:string) {
		const path = changePath.split('.');
		const prop = check<string>(path.pop(), isString, "prop");
		const parent = check<Mozel>(this.model.$path(path), instanceOf(Mozel), "parent");
		const property = parent.$property(prop as any);
		if(!property) throw new Error(`Change path does not match any property on ${this.model.constructor.name}: ${changePath}.`);

		this.isReference = property.isReference;
		if(this.isReference && !this.resolveReferences) {
			return; // should not try to resolve references (yet)
		}

		if(value !== undefined && !this.isPropertyType(value)) {
			throw new Error("New property value is not of expected type.");
		}

		let output = this.syncValue(value);

		const old = this.current;
		this.current = output;
		this.events.changed.fire(new ValueChangeEvent<T>(changePath, this.isReference, output, old));
	}

	/**
	 * Register an intialization callback to be called on every new value.
	 * @param callback
	 */
	init(callback:callback<T|undefined>) {
		this.events.changed.on(event => {
			callback(event.current);
		});
		return this;
	}

	/**
	 * Register a deinitialization callback to be called on every value before it gets overwritten
	 * @param callback
	 */
	deinit(callback:callback<T|undefined>) {
		this.events.changed.on(event => {
			callback(event.old);
		});
		return this;
	}

	protected syncValue(value:P|undefined):T|undefined {
		throw new Error("Not Implemented");
	}

	get() {
		return this.current;
	}
}
