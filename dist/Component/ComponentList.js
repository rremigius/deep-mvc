import { isArray, isFunction, isMatch } from 'lodash';
import EventEmitter from "@/EventEmitter";
import PropertySync, { PropertySyncEvents } from "@/PropertySync";
import { check, instanceOf } from "validation-kit";
import { Collection } from "mozel";
export class ComponentAddedEvent {
    constructor(component) {
        this.component = component;
    }
}
export class ComponentRemovedEvent {
    constructor(component) {
        this.component = component;
    }
}
class ComponentListEvents extends PropertySyncEvents {
    constructor() {
        super(...arguments);
        // Using $register for generic type definition on EventEmitter
        this.add = this.$register(new EventEmitter(ComponentAddedEvent), ComponentAddedEvent.name);
        this.remove = this.$register(new EventEmitter(ComponentRemovedEvent), ComponentRemovedEvent.name);
    }
}
export default class ComponentList extends PropertySync {
    constructor(parent, watchModel, path, PropertyType, SyncType, factory) {
        super(watchModel, path, Collection, SyncType); // TS: we override isSyncType
        this.addedListener = (model) => {
            const $model = check(model, instanceOf(this.ComponentModelClass), this.ComponentModelClass.name, 'model');
            const component = this.factory.resolve($model, this.ComponentClass, true);
            if (component && !this.has(component)) {
                this.add(component);
            }
        };
        this.removedListener = (model) => {
            const $model = check(model, instanceOf(this.ComponentModelClass), this.ComponentModelClass.name, 'model');
            const component = this.factory.registry.byGid($model.gid);
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
        return isArray(value) && !value.find(item => !(item instanceof this.SyncType));
    }
    /**
     * Generates output values based on the Collection values
     * @param {Collection} collection
     * @protected
     */
    syncValue(collection) {
        this.clear();
        // Remove listeners from current collection
        if (this.currentCollection) {
            this.currentCollection.removeAddedListener(this.addedListener);
            this.currentCollection.removeRemovedListener(this.removedListener);
        }
        this.currentCollection = collection;
        if (!collection)
            return []; // because of this, `current` is always defined
        // Add listeners to new collection
        collection.onAdded(this.addedListener);
        collection.onRemoved(this.removedListener);
        // Resolve components for each of the models
        const components = collection.map((model) => this.factory.resolve(model, this.ComponentClass, true));
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
        if (isArray(component)) {
            return component.reduce((sum, item) => this.remove(item), 0);
        }
        const check = isFunction(component) ? component : (item) => item === component;
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
        const check = isFunction(predicate)
            ? predicate
            : (candidate) => isMatch(candidate, predicate);
        for (const component of this.current.values()) {
            if (check(component)) {
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
//# sourceMappingURL=ComponentList.js.map