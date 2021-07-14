import Component, { ComponentConstructor } from "../Component";
import PropertySync, { PropertySyncEvents } from "../PropertySync";
import { Constructor } from "validation-kit";
import ComponentFactory from "../Component/ComponentFactory";
import Mozel, { Collection } from "mozel";
import { EventEmitter } from "event-interface-mixin";
export declare class ComponentAddedEvent<T extends Component> {
    component: T;
    constructor(component: T);
}
export declare class ComponentRemovedEvent<T extends Component> {
    component: T;
    constructor(component: T);
}
declare class ComponentListEvents<C extends Component> extends PropertySyncEvents<C[]> {
    add: EventEmitter<ComponentAddedEvent<C>>;
    remove: EventEmitter<ComponentRemovedEvent<C>>;
}
declare type ComponentModel<C extends Component> = C['model'];
export default class ComponentList<C extends Component> extends PropertySync<Collection<ComponentModel<C>>, C[]> {
    ComponentModelClass: Constructor<ComponentModel<C>>;
    ComponentClass: ComponentConstructor<C>;
    factory: ComponentFactory;
    currentCollection?: Collection<ComponentModel<C>>;
    parent: Component;
    /** Gets current list of Components */
    get current(): C[];
    private addedListener;
    private removedListener;
    readonly events: ComponentListEvents<C>;
    constructor(parent: Component, watchModel: Mozel, path: string, PropertyType: Constructor<ComponentModel<C>>, SyncType: ComponentConstructor<C>, factory: ComponentFactory);
    /**
     * Determines whether all items in the generated list match the required output type.
     * @param value
     */
    isSyncType(value: unknown): value is C[];
    /**
     * Generates output values based on the Collection values
     * @param {Collection} collection
     * @protected
     */
    protected syncValue(collection?: Collection<ComponentModel<C>>): C[];
    /**
     * Removes all Components from the ComponentList, firing the `remove` event for each.
     */
    clear(): void;
    /**
     * Add a Component to the ComponentList.
     * @param {Component} component
     */
    add(component: C): void;
    /**
     * Checks if the given Component is included in the current list.
     * @param {Component} component
     */
    has(component: C): boolean;
    /**
     * Get the Component at the given index.
     * @param {number} index
     */
    get(index: number): C;
    /**
     * Removes the given component (if a single Component is provided) or all Components matched by the given callback.
     * @param {Component|Function} component
     */
    remove(component: C | C[] | ((component: C) => boolean)): number;
    /**
     * Calls the given function for each of the Components in the list.
     * @param {Function} callback
     */
    each(callback: (component: C, index: number) => void): void;
    /**
     * Calls the given function for each of the Components in the list and returns an array of the results.
     * @param {Function} callback
     */
    map<T>(callback: (component: C, index: number) => T): T[];
    /**
     * Returns a list of the Components that are matches by the given callback.
     * @param {Function} callback
     */
    filter(callback: (component: C, index: number) => boolean): C[];
    /**
     * Find the first Component matching the given predicate.
     * @param {Function|object} predicate	If a function is provided, will use the function return value to determine
     * 										whether a Component is a match.
     * 										If an object is provided, will check if all keys of the object are equal to
     * 										the same keys of the Component.
     */
    find(predicate: ((value: C, index: number) => boolean) | Record<string, unknown>): C | undefined;
    /**
     * Counts the Components in the list.
     */
    count(): number;
    /**
     * Destroys all components in the list, and clears it.
     */
    destroy(): void;
}
export {};
