import Mozel, {immediate} from "mozel";
import {isString} from 'lodash';
import {callback, Events} from "./EventEmitter";
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
	change = this.$event<ValueChangeEvent<T>>(ValueChangeEvent);
}

/**
 * Watches a Model path for changes, does something based on the new value when it changes and fires
 * an event with the new and old constructs.
 */
export default class PropertySync<P extends PropertyValue,T> {
	protected _current?:T;
	get current() {
		return this._current;
	}

	events = new PropertySyncEvents<T>();

	model:Mozel;
	path:string;
	readonly PropertyType:PropertyType;
	readonly SyncType:Constructor<T>;

	watching:boolean = false;
	resolveReferences:boolean = false;
	isReference:boolean = false;

	constructor(watchModel:Mozel, path:string, PropertyType:PropertyType, SyncType:Constructor<T>) {
		this.model = watchModel;
		this.path = path;
		this.PropertyType = PropertyType;
		this.SyncType = SyncType;
	}

	/**
	 * Checks if a value matches the property type defined in this PropertySync.
	 * @param value
	 */
	isPropertyType(value:unknown):value is P {
		return Property.checkType(value, this.PropertyType);
	}

	/**
	 * Checks if a value matches the type of the required output of the PropertySync.
	 * @param value
	 */
	isSyncType(value:unknown):value is T {
		return value instanceof this.syncValue
	}

	/**
	 * Start watching for changes and generate output from model with any changes, starting with the current value.
	 */
	startWatching() {
		if(this.watching) {
			return;
		}
		this.watching = true;
		this.model.$watch(this.path,({newValue, oldValue, valuePath}) => {
			this.syncFromModel(newValue, valuePath);
		}, {immediate});
	}

	/**
	 * Uses the current model value at the configured path to generate a synced output.
	 */
	sync() {
		const current = this.model.$path(this.path);
		this.syncFromModel(current, this.path);
	}

	private syncFromModel(value:PropertyValue, changePath:string) {
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
		this._current = output;
		this.events.change.fire(new ValueChangeEvent<T>(changePath, this.isReference, output, old));
	}

	/**
	 * Register an intialization callback to be called on every new value.
	 * @param callback
	 */
	init(callback:callback<T|undefined>) {
		this.events.change.on(event => {
			callback(event.current);
		});
		return this;
	}

	/**
	 * Register a deinitialization callback to be called on every value before it gets replaced.
	 * @param callback
	 */
	deinit(callback:callback<T|undefined>) {
		this.events.change.on(event => {
			callback(event.old);
		});
		return this;
	}

	/**
	 * Sets the model value
	 * @param {P|undefined} value
	 */
	set(value:any|undefined) {
		return this.model.$set(this.path, value, true);
	}

	/**
	 * Generates an output based on the given value.
	 * @param value
	 * @protected
	 */
	protected syncValue(value:P|undefined):T|undefined {
		throw new Error("Not Implemented");
	}
}
