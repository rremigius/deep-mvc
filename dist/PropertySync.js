"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertySyncEvents = exports.ValueChangeEvent = void 0;
const tslib_1 = require("tslib");
const mozel_1 = tslib_1.__importStar(require("mozel"));
const lodash_1 = require("lodash");
const Property_1 = tslib_1.__importDefault(require("mozel/dist/Property"));
const validation_kit_1 = require("validation-kit");
const event_interface_mixin_1 = tslib_1.__importDefault(require("event-interface-mixin"));
class ValueChangeEvent {
    constructor(path, isReference, current, old) {
        this.path = path;
        this.isReference = isReference;
        this.current = current;
        this.old = old;
    }
}
exports.ValueChangeEvent = ValueChangeEvent;
class PropertySyncEvents extends event_interface_mixin_1.default {
    constructor() {
        super(...arguments);
        this.change = this.$event(ValueChangeEvent);
    }
}
exports.PropertySyncEvents = PropertySyncEvents;
/**
 * Watches a Model path for changes, does something based on the new value when it changes and fires
 * an event with the new and old constructs.
 */
class PropertySync {
    constructor(watchModel, path, PropertyType, SyncType) {
        this.events = new PropertySyncEvents();
        this.watching = false;
        this.model = watchModel;
        this.path = path;
        this.PropertyType = PropertyType;
        this.SyncType = SyncType;
        this.isReference = lodash_1.get(watchModel.static.$schema(), path).$reference;
    }
    get current() {
        return this.getCurrent(true);
    }
    getCurrent(resolveReference = true) {
        if (this.isReference && resolveReference && !this.currentSource !== this.resolvedReference) {
            this.resolveReferences();
            if (this.currentSource && !this._current) {
                throw new Error(`Could not resolve reference.`);
            }
        }
        return this._current;
    }
    /**
     * Checks if a value matches the property type defined in this PropertySync.
     * @param value
     */
    isPropertyType(value) {
        return Property_1.default.checkType(value, this.PropertyType);
    }
    /**
     * Checks if a value matches the type of the required output of the PropertySync.
     * @param value
     */
    isSyncType(value) {
        return value instanceof this.SyncType;
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
        }, { immediate: mozel_1.immediate });
    }
    resolveReferences() {
        if (!this.isReference || !this.currentSource)
            return;
        return this.syncValue(this.currentSource);
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
        const prop = validation_kit_1.check(path.pop(), lodash_1.isString, "prop");
        const parent = validation_kit_1.check(this.model.$path(path), validation_kit_1.instanceOf(mozel_1.default), "parent");
        const property = parent.$property(prop);
        if (!property)
            throw new Error(`Change path does not match any property on ${this.model.constructor.name}: ${changePath}.`);
        if (value !== undefined && !this.isPropertyType(value)) {
            throw new Error("New property value is not of expected type.");
        }
        this.currentSource = value;
        this.syncValue(value);
    }
    syncValue(value) {
        let output = this.modelToComponent(value);
        const old = this.getCurrent(false);
        this._current = output;
        if (old !== output) {
            this.events.change.fire(new ValueChangeEvent(this.path, this.isReference, output, old));
        }
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
     * Sets the model value
     * @param {P|undefined} value
     */
    set(value) {
        return this.model.$set(this.path, value, true);
    }
    /**
     * Generates an output based on the given value.
     * @param value
     * @protected
     */
    modelToComponent(value) {
        throw new Error("Not Implemented");
    }
}
exports.default = PropertySync;
//# sourceMappingURL=PropertySync.js.map