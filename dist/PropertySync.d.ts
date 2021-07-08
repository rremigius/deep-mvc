import Mozel from "mozel";
import { callback, Events } from "./EventEmitter";
import { PropertyType, PropertyValue } from "mozel/dist/Property";
import { Constructor } from "validation-kit";
export declare class ValueChangeEvent<T> {
    path: string;
    isReference: boolean;
    current?: T | undefined;
    old?: T | undefined;
    constructor(path: string, isReference: boolean, current?: T | undefined, old?: T | undefined);
}
export declare class PropertySyncEvents<T> extends Events {
    change: import("./EventEmitter").default<ValueChangeEvent<T>>;
}
/**
 * Watches a Model path for changes, does something based on the new value when it changes and fires
 * an event with the new and old constructs.
 */
export default class PropertySync<P extends PropertyValue, T> {
    protected _current?: T;
    get current(): T | undefined;
    events: PropertySyncEvents<T>;
    model: Mozel;
    path: string;
    readonly PropertyType: PropertyType;
    readonly SyncType: Constructor<T>;
    watching: boolean;
    resolveReferences: boolean;
    isReference: boolean;
    constructor(watchModel: Mozel, path: string, PropertyType: PropertyType, SyncType: Constructor<T>);
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
    /**
     * Uses the current model value at the configured path to generate a synced output.
     */
    sync(): void;
    private syncFromModel;
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
    set(value: any | undefined): PropertyValue;
    /**
     * Generates an output based on the given value.
     * @param value
     * @protected
     */
    protected syncValue(value: P | undefined): T | undefined;
}
