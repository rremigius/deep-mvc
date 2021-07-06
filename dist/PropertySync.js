import Mozel, { immediate } from "mozel";
import { isString } from 'lodash';
import { Events } from "@/EventEmitter";
import Property from "mozel/dist/Property";
import { check, instanceOf } from "validation-kit";
export class ValueChangeEvent {
    constructor(path, isReference, current, old) {
        this.path = path;
        this.isReference = isReference;
        this.current = current;
        this.old = old;
    }
}
export class PropertySyncEvents extends Events {
    constructor() {
        super(...arguments);
        this.change = this.$event(ValueChangeEvent);
    }
}
/**
 * Watches a Model path for changes, does something based on the new value when it changes and fires
 * an event with the new and old constructs.
 */
export default class PropertySync {
    constructor(watchModel, path, PropertyType, SyncType) {
        this.events = new PropertySyncEvents();
        this.watching = false;
        this.resolveReferences = false;
        this.isReference = false;
        this.model = watchModel;
        this.path = path;
        this.PropertyType = PropertyType;
        this.SyncType = SyncType;
    }
    get current() {
        return this._current;
    }
    /**
     * Checks if a value matches the property type defined in this PropertySync.
     * @param value
     */
    isPropertyType(value) {
        return Property.checkType(value, this.PropertyType);
    }
    /**
     * Checks if a value matches the type of the required output of the PropertySync.
     * @param value
     */
    isSyncType(value) {
        return value instanceof this.syncValue;
    }
    /**
     * Start watching for changes and generate output from model with any changes, starting with the current value.
     */
    startWatching() {
        if (this.watching) {
            return;
        }
        this.watching = true;
        this.model.$watch(this.path, ({ newValue, oldValue, valuePath }) => {
            this.syncFromModel(newValue, valuePath);
        }, { immediate });
    }
    /**
     * Uses the current model value at the configured path to generate a synced output.
     */
    sync() {
        const current = this.model.$path(this.path);
        this.syncFromModel(current, this.path);
    }
    syncFromModel(value, changePath) {
        const path = changePath.split('.');
        const prop = check(path.pop(), isString, "prop");
        const parent = check(this.model.$path(path), instanceOf(Mozel), "parent");
        const property = parent.$property(prop);
        if (!property)
            throw new Error(`Change path does not match any property on ${this.model.constructor.name}: ${changePath}.`);
        this.isReference = property.isReference;
        if (this.isReference && !this.resolveReferences) {
            return; // should not try to resolve references (yet)
        }
        if (value !== undefined && !this.isPropertyType(value)) {
            throw new Error("New property value is not of expected type.");
        }
        let output = this.syncValue(value);
        const old = this.current;
        this._current = output;
        this.events.change.fire(new ValueChangeEvent(changePath, this.isReference, output, old));
    }
    /**
     * Register an intialization callback to be called on every new value.
     * @param callback
     */
    init(callback) {
        this.events.change.on(event => {
            callback(event.current);
        });
        return this;
    }
    /**
     * Register a deinitialization callback to be called on every value before it gets replaced.
     * @param callback
     */
    deinit(callback) {
        this.events.change.on(event => {
            callback(event.old);
        });
        return this;
    }
    /**
     * Generates an output based on the given value.
     * @param value
     * @protected
     */
    syncValue(value) {
        throw new Error("Not Implemented");
    }
}
//# sourceMappingURL=PropertySync.js.map