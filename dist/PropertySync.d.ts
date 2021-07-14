import Mozel from "mozel";
import { PropertyType, PropertyValue } from "mozel/dist/Property";
import { Constructor } from "validation-kit";
import EventInterface from "event-interface-mixin";
import { callback } from "event-interface-mixin/dist/EventEmitter";
export declare class ValueChangeEvent<T> {
    path: string;
    isReference: boolean;
    current?: T | undefined;
    old?: T | undefined;
    constructor(path: string, isReference: boolean, current?: T | undefined, old?: T | undefined);
}
export declare class PropertySyncEvents<T> extends EventInterface {
    change: import("event-interface-mixin").EventEmitter<ValueChangeEvent<T>>;
}
/**
 * Watches a Model path for changes, does something based on the new value when it changes and fires
 * an event with the new and old constructs.
 */
export default class PropertySync<P extends PropertyValue, T> {
    protected _current?: T;
    get current(): T | undefined;
    protected currentSource?: P;
    events: PropertySyncEvents<T>;
    model: Mozel;
    path: string;
    readonly PropertyType: PropertyType;
    readonly SyncType: Constructor<T>;
    watching: boolean;
    isReference: boolean;
    constructor(watchModel: Mozel, path: string, PropertyType: PropertyType, SyncType: Constructor<T>);
    getCurrent(resolveReference?: boolean): T | undefined;
    /**
     * Checks if a value matches the property type defined in this PropertySync.
     * @param value
     */
    isPropertyType(value: unknown): value is P;
    /**
     * Checks if a value matches the type of the required output of the PropertySync.
     * @param value
     */
    isSyncType(value: unknown): value is T;
    /**
     * Start watching for changes and generate output from model with any changes, starting with the current value.
     */
    startWatching(): void;
    resolveReferences(): void;
    /**
     * Uses the current model value at the configured path to generate a synced output.
     */
    sync(): void;
    private syncFromModel;
    protected syncValue(value: P): void;
    /**
     * Register an intialization callback to be called on every new value.
     * @param callback
     */
    init(callback: callback<T | undefined>): this;
    /**
     * Register a deinitialization callback to be called on every value before it gets replaced.
     * @param callback
     */
    deinit(callback: callback<T | undefined>): this;
    /**
     * Sets the model value
     * @param {P|undefined} value
     */
    set(value: any | undefined): import("mozel/dist/Property").PropertyInput;
    /**
     * Generates an output based on the given value.
     * @param value
     * @protected
     */
    protected modelToComponent(value: P | undefined): T | undefined;
}
