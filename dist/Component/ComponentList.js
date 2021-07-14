"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentRemovedEvent = exports.ComponentAddedEvent = void 0;
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const PropertySync_1 = tslib_1.__importStar(require("../PropertySync"));
const validation_kit_1 = require("validation-kit");
const mozel_1 = require("mozel");
const event_interface_mixin_1 = require("event-interface-mixin");
const log_1 = tslib_1.__importDefault(require("../log"));
const log = log_1.default.instance("component-list");
class ComponentAddedEvent {
    constructor(component) {
        this.component = component;
    }
}
exports.ComponentAddedEvent = ComponentAddedEvent;
class ComponentRemovedEvent {
    constructor(component) {
        this.component = component;
    }
}
exports.ComponentRemovedEvent = ComponentRemovedEvent;
class ComponentListEvents extends PropertySync_1.PropertySyncEvents {
    constructor() {
        super(...arguments);
        // Using $register for generic type definition on EventEmitter
        this.add = this.$register(new event_interface_mixin_1.EventEmitter(ComponentAddedEvent), ComponentAddedEvent.name);
        this.remove = this.$register(new event_interface_mixin_1.EventEmitter(ComponentRemovedEvent), ComponentRemovedEvent.name);
    }
}
class ComponentList extends PropertySync_1.default {
    constructor(parent, watchModel, path, PropertyType, SyncType, factory) {
        super(watchModel, path, mozel_1.Collection, SyncType); // TS: we override isSyncType
        this.addedListener = (event) => {
            const model = validation_kit_1.check(event.item, validation_kit_1.instanceOf(this.ComponentModelClass), this.ComponentModelClass.name, 'model');
            const component = this.factory.resolve(model, this.ComponentClass, true);
            if (component && !this.has(component)) {
                this.add(component);
            }
        };
        this.removedListener = (event) => {
            const model = validation_kit_1.check(event.item, validation_kit_1.instanceOf(this.ComponentModelClass), this.ComponentModelClass.name, 'model');
            const component = this.factory.registry.byGid(model.gid);
            if (component instanceof this.ComponentClass) {
                this.remove(component);
            }
        };
        this.events = new ComponentListEvents();
        this.ComponentModelClass = PropertyType;
        this.ComponentClass = SyncType;
        this.factory = factory;
        this.parent = parent;
    }
    /** Gets current list of Components */
    get current() {
        return this._current ? this._current : [];
    }
    /**
     * Determines whether all items in the generated list match the required output type.
     * @param value
     */
    isSyncType(value) {
        return lodash_1.isArray(value) && !value.find(item => !(item instanceof this.SyncType));
    }
    /**
     * Generates output values based on the Collection values
     * @param {Collection} collection
     * @protected
     */
    modelToComponent(collection) {
        this.clear();
        // Remove listeners from current collection
        if (this.currentCollection) {
            this.currentCollection.events.added.off(this.addedListener);
            this.currentCollection.events.removed.off(this.removedListener);
        }
        this.currentCollection = collection;
        if (!collection)
            return []; // because of this, `current` is always defined
        // Add listeners to new collection
        collection.events.added.on(this.addedListener);
        collection.events.removed.on(this.removedListener);
        // Resolve components for each of the models
        const components = [];
        collection.map((model) => {
            const component = this.factory.resolve(model, this.ComponentClass, !this.isReference);
            if (component) {
                if (!(component instanceof this.ComponentClass)) {
                    log.error(`Could not resolve component for ${model.static.type} (${model.gid})`);
                }
                else {
                    components.push(component);
                }
            }
            else if (!this.isReference) {
                log.error(`Could not resolve component for ${model.static.type} (${model.gid})`);
            }
        });
        if (this.isReference && components.length !== collection.length) {
            // Not all components could be resolved, perhaps later
            return [];
        }
        // Add one by one to trigger events on ComponentList
        components.forEach(component => this.add(component));
        return components;
    }
    /**
     * Removes all Components from the ComponentList, firing the `remove` event for each.
     */
    clear() {
        if (!this.current)
            return;
        for (let i = this.current.length - 1; i >= 0; i--) {
            const item = this.current[i];
            if (!this.isReference)
                item.setParent(undefined);
            this.current.splice(i, 1);
            this.events.remove.fire(new ComponentRemovedEvent(item));
        }
    }
    /**
     * Add a Component to the ComponentList.
     * @param {Component} component
     */
    add(component) {
        if (this.has(component)) {
            // already in list, don't add again
            return;
        }
        if (!this.isReference)
            component.setParent(this.parent);
        this.current.push(component);
        this.events.add.fire(new ComponentAddedEvent(component));
    }
    /**
     * Checks if the given Component is included in the current list.
     * @param {Component} component
     */
    has(component) {
        return !!this.current.find(item => item === component);
    }
    /**
     * Get the Component at the given index.
     * @param {number} index
     */
    get(index) {
        return this.current[index];
    }
    /**
     * Removes the given component (if a single Component is provided) or all Components matched by the given callback.
     * @param {Component|Function} component
     */
    remove(component) {
        if (lodash_1.isArray(component)) {
            return component.reduce((sum, item) => this.remove(item), 0);
        }
        const check = lodash_1.isFunction(component) ? component : (item) => item === component;
        let count = 0;
        for (let i = this.current.length - 1; i >= 0; i--) {
            let item = this.current[i];
            if (check(item)) {
                if (!this.isReference)
                    item.setParent(undefined);
                this.current.splice(i, 1);
                this.events.remove.fire(new ComponentRemovedEvent(item));
            }
        }
        return count;
    }
    /**
     * Calls the given function for each of the Components in the list.
     * @param {Function} callback
     */
    each(callback) {
        this.current.forEach(callback);
    }
    /**
     * Calls the given function for each of the Components in the list and returns an array of the results.
     * @param {Function} callback
     */
    map(callback) {
        return this.current.map(callback);
    }
    /**
     * Returns a list of the Components that are matches by the given callback.
     * @param {Function} callback
     */
    filter(callback) {
        return this.current.filter(callback);
    }
    /**
     * Find the first Component matching the given predicate.
     * @param {Function|object} predicate	If a function is provided, will use the function return value to determine
     * 										whether a Component is a match.
     * 										If an object is provided, will check if all keys of the object are equal to
     * 										the same keys of the Component.
     */
    find(predicate) {
        const check = lodash_1.isFunction(predicate)
            ? predicate
            : (candidate) => lodash_1.isMatch(candidate, predicate);
        let i = 0;
        for (const component of this.current.values()) {
            if (check(component, i++)) {
                return component;
            }
        }
    }
    /**
     * Counts the Components in the list.
     */
    count() {
        return this.current.length;
    }
    /**
     * Destroys all components in the list, and clears it.
     */
    destroy() {
        this.current.forEach(component => component.destroy());
        this.clear();
    }
}
exports.default = ComponentList;
//# sourceMappingURL=ComponentList.js.map