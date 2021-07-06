import { Container } from "inversify";
import ComponentFactory from "./Component/ComponentFactory";
import EventListener from "./EventListener";
import ComponentList from "./Component/ComponentList";
import ComponentSlot from "./Component/ComponentSlot";
import Mozel, { alphanumeric, CollectionSchema, MozelSchema, PropertySchema, Registry } from "mozel";
import EventBus from "./EventBus";
import EventEmitter, { callback, Events } from "./EventEmitter";
import Property, { PropertyValue } from "mozel/dist/Property";
import { Constructor } from "validation-kit";
import PropertyWatcher, { PropertyChangeHandler, PropertyWatcherOptionsArgument } from "mozel/dist/PropertyWatcher";
export declare type ComponentConstructor<T extends Component> = {
    new (...args: any[]): T;
    Model: (typeof Mozel);
};
export declare type ComponentActionData<E> = E extends ComponentAction<infer D> ? D : object;
/**
 * Base class for Component Actions.
 */
export declare class ComponentAction<T extends object> {
    data: T;
    /**
     * Payload of the event.
     * @param {T} data
     */
    constructor(data: T);
}
/**
 * Base class for Component Events
 */
export declare class ComponentEvent<T extends object> {
    origin?: Component;
    data: T;
    /**
     *
     * @param {Component} origin	The Component from which this event originates.
     * @param {T} data				The event payload.
     */
    constructor(origin: Component | undefined, data?: T);
}
export declare type ComponentEventData<E> = E extends ComponentEvent<infer D> ? D : object;
export declare type ComponentSlotDefinition = {
    property: string;
    modelPath: string;
    ExpectedComponentClass: ComponentConstructor<any>;
};
export declare type ComponentListDefinition = {
    property: string;
    modelPath: string;
    ExpectedComponentClass: ComponentConstructor<any>;
};
/**
 * Fires when the Component gets enabled.
 */
export declare class ComponentEnabledEvent extends ComponentEvent<object> {
}
/**
 * Fires when the Component gets disabled.
 */
export declare class ComponentDisabledEvent extends ComponentEvent<object> {
}
export declare class ComponentEvents extends Events {
    enabled: EventEmitter<ComponentEnabledEvent>;
    disabled: EventEmitter<ComponentDisabledEvent>;
    constructor();
}
/**
 * Action to enable/disable the Component.
 */
export declare class ComponentEnableAction extends ComponentAction<{
    enable: boolean;
}> {
}
export declare class ComponentActions extends Events {
    $action<T>(ActionClass: Constructor<T>): EventEmitter<T>;
    enable: EventEmitter<ComponentEnableAction>;
}
/**
 * Defines a ComponentSlot for the current Component class, to instantiate or find the child component corresponding
 * to the model at the given path.
 * @param modelPath					Path of the model based on which the child component should be resolved.
 * 									Can be a string, or a Schema provided by `schema(Model)`.
 * @param ExpectedComponentClass	Component class that is expected to be instantiated (runtime verification).
 */
export declare function component<C extends Component, M extends C['model']>(modelPath: string | MozelSchema<M>, ExpectedComponentClass: ComponentConstructor<C>): (target: Component, propertyName: string) => void;
/**
 * Defines a ComponentList for the current Component class, to instantiate or find the child components corresponding
 * to the model at the given path.
 * @param modelPath					Path of the model based on which the child components should be resolved.
 * 									Can be a string, or a Schema provided by `schema(Model)`.
 * @param ExpectedComponentClass	Component class that is expected to be instantiated (runtime verification).
 */
export declare function components<C extends Component, M extends C['model']>(modelPath: string | CollectionSchema<M>, ExpectedComponentClass: ComponentConstructor<C>): (target: Component, propertyName: string) => void;
/**
 * Base Component class. Designed to be a functional counterpart of a data model.
 */
export default class Component {
    static Model: typeof Mozel;
    static Events: typeof ComponentEvents;
    static Actions: typeof ComponentActions;
    /**
     * Creates a ComponentFactory, with the current Component class already registered.
     */
    static createFactory(): ComponentFactory;
    private static _classComponentSlotDefinitions;
    private static _classComponentListDefinitions;
    /**
     * Gets the definitions for ComponentSlots for this class.
     */
    static get classComponentSlotDefinitions(): ComponentSlotDefinition[];
    /**
     * Gets the definitions for ComponentLists for this class.
     */
    static get classComponentListDefinitions(): ComponentListDefinition[];
    /**
     * Defines a ComponentSlot for the current Component class, to instantiate or find the child component corresponding
     * to the model at the given path.
     * @param {string} property			Name of the property by which the ComponentSlot can be accessed.
     * @param modelPath					Path of the model based on which the child component should be resolved..
     * 									Can be a string, or a Schema provided by `schema(Model)`.
     * @param ExpectedComponentClass	Component class that is expected to be instantiated (runtime verification).
     */
    static defineComponentSlot(property: string, modelPath: string, ExpectedComponentClass: ComponentConstructor<any>): void;
    /**
     * Defines a ComponentList for the current Component class, to instantiate or find the child components corresponding
     * to the model at the given path.
     * @param {string} property			Name of the property by which the ComponentList can be accessed.
     * @param modelPath					Path of the model based on which the child components should be resolved.
     * 									Can be a string, or a Schema provided by `schema(Model)`.
     * @param ExpectedComponentClass	Component class that is expected to be instantiated (runtime verification).
     */
    static defineComponentList(property: string, modelPath: string, ExpectedComponentClass: ComponentConstructor<any>): void;
    /** Unique identifier shared only between model and all its components */
    readonly gid: alphanumeric;
    /** The model on which this Component is based */
    readonly model: Mozel;
    /** The factory that created this Component, and is used to create child Components */
    readonly factory: ComponentFactory;
    /** The registry in which this Component is registered, and which can be used to find other Components */
    readonly registry: Registry<Component>;
    /** The eventBus to which all Components created by the same factory are connected and can send and receive events to/from */
    readonly eventBus: EventBus;
    /** The Inversify dependency Container to which all Component classes, factory, registry, eventBus and other common services are bound */
    readonly dependencies: Container;
    private _parent?;
    /** The parent Component to which this Component is a direct child */
    get parent(): Component | undefined;
    /** Contains all events that can be fired and subscribed to on this Component. */
    events: ComponentEvents;
    /** Contains all actions that can be called on this Component. */
    actions: ComponentActions;
    private componentSlotDefinitions;
    private componentListDefinitions;
    private allChildren;
    private loader;
    private lastReportedEnabledState?;
    private eventListeners;
    private watchers;
    private permanentWatchers;
    private initialized;
    private parentEnabled;
    /** Property name of the model that represents the enabled state of the Component */
    protected enabledProperty: string;
    get static(): typeof Component;
    private _enabled;
    get enabled(): boolean;
    private _started;
    /** Whether or not the Component has been started (with the start() method)*/
    get started(): boolean;
    /** Component class name */
    get name(): string;
    /** Model name */
    get modelName(): string;
    /** Returns the promise for initial loading */
    get loading(): Promise<unknown>;
    constructor(model: Mozel, componentFactory: ComponentFactory, registry: Registry<Component>, eventBus: EventBus, dependencies: Container);
    /**
     * Tells whether or not the model has the property that represents the enabled state of the Component.
     * @return {boolean} True if the property exists on the model.
     */
    hasEnabledPropertyInModel(): boolean;
    private collectClassDefinitions;
    private initClassDefinitions;
    /**
     * Initializes the Component. Called from the constructor.
     * @protected
     */
    protected onInit(): void;
    /**
     * Sets up the actions and events as defined by the static properties `Actions` and `Events`.
     */
    protected setupActionsAndEvents(): void;
    /**
     * Calls an action on the Component by its name. Will throw an error if the action does not exist.
     * @param {string} name		The name of the action (usually the Action class name).
     * @param payload			The payload required by the specified action.
     */
    callAction(name: string, payload: any): void;
    /**
     * Creates a model watcher at the given path, without starting adding it to the Model or starting it.
     * Will fire immediately once added to the Model.
     * @param {string|PropertySchema<T>|MozelSchema<T>} path		Path or schema of the property to watch.
     * @param {PropertyChangeHandler<T>} handler					To be called when the property changes.
     * @param {PropertyWatcherOptionsArgument} 	options
     * @param {boolean} 						options.deep		Fire when any child value of the property changes.
     * @param {number}							options.throttle	Number of ms during which the handler will be called
     * 																only once, even if any matching values changed
     * 																multiple times.
     */
    createWatcher<T extends PropertyValue>(path: string | PropertySchema<T> | MozelSchema<T>, handler: PropertyChangeHandler<T>, options?: PropertyWatcherOptionsArgument): PropertyWatcher;
    /**
     * Watches model at the given path (only when the Component is enabled).
     * Will always use `immediate` option, so will check for changes every time the Component gets enabled.
     * @param {string|PropertySchema<T>|MozelSchema<T>} path		Path or schema of the property to watch.
     * @param {PropertyChangeHandler<T>} handler					To be called when the property changes.
     * @param {PropertyWatcherOptionsArgument} 	options
     * @param {boolean} 						options.deep		Fire when any child value of the property changes.
     * @param {number}							options.throttle	Number of ms during which the handler will be called
     * 																only once, even if any matching values changed
     * 																multiple times.
     */
    watch<T extends PropertyValue>(path: string | PropertySchema<T> | MozelSchema<T>, handler: PropertyChangeHandler<T>, options?: PropertyWatcherOptionsArgument): PropertyWatcher;
    /**
     * Watches model at the given path, whether the Component is enabled or disabled, until the Component is destroyed.
     * Will start watching immediately, and fire first time when this method is called.
     * @param {string|PropertySchema<T>|MozelSchema<T>} path		Path or schema of the property to watch.
     * @param {PropertyChangeHandler<T>} handler					To be called when the property changes.
     * @param {PropertyWatcherOptionsArgument} 	options
     * @param {boolean} 						options.deep		Fire when any child value of the property changes.
     * @param {number}							options.throttle	Number of ms during which the handler will be called
     * 																only once, even if any matching values changed
     * 																multiple times.
     */
    watchAlways<T extends PropertyValue>(path: string | PropertySchema<T> | MozelSchema<T>, handler: PropertyChangeHandler<T>, options?: PropertyWatcherOptionsArgument): PropertyWatcher;
    /**
     * Sets the parentof this Component.
     * @param {Component} parent
     */
    setParent(parent?: Component): void;
    /**
     * Finds the first parent up the hierarchy that matches the given conditions.
     * @param {(component:Component)=>boolean}	criteria	Function to evaluated whether a component matches the conditions.
     */
    findParent(criteria: (component: Component) => boolean): Component | undefined;
    /**
     * Gets the root Component of the hierarchy.
     */
    getRootComponent(): Component;
    /**
     * Generates and log an Error.
     * @param args	Any number of arguments can be logged; only the first argument will be used as the Error message.
     * @protected
     */
    protected error(...args: unknown[]): Error;
    protected setupSubComponent<T extends Component>(modelPath: string | Property, ComponentClass: ComponentConstructor<T>): ComponentSlot<T>;
    protected setupSubComponents<P extends Mozel, T extends Component>(modelPath: string | Property, ComponentClass: ComponentConstructor<T>): ComponentList<T>;
    /**
     * Listens to an event from the given source by its event name.
     * @param {Component} source
     * @param {string} eventName
     * @param {callback} callback
     */
    listenToEventName(source: Events, eventName: string, callback: callback<unknown>): void;
    /**
     * Starts listening to an event of the target EventEmitterr, storing the callback locally to be destroyed and
     * unsubscribed when the Component is destroyed.
     * @param {EventEmitter<T>>} event
     * @param {callback<T>} callback
     */
    listenTo<T>(event: EventEmitter<T>, callback: callback<T>): EventListener<T>;
    /**
     * Runs the given callback on all children, whether in ComponentSlots or ComponentLists.
     * @param {Function} callback	Callback that takes the Component.
     * @param [includeReferences]	If set to `true`, will also run the callback on Components that are references.
     * 								Defaults to `false`.
     */
    forEachChild(callback: (child: Component) => void, includeReferences?: boolean): void;
    /**
     * Resolves all references of defined ComponentSlots and ComponentLists.
     */
    resolveReferences(): void;
    /**
     * Performs initial asynchronous loading of the Component.
     */
    load(): Promise<void>;
    /**
     * Starts the Component. Unless the Component is disabled, it will be active directly afterwards.
     */
    start(): void;
    /**
     * Destroys the model, triggering the destruction of all related components, including this one.
     * Will clean up registered callbacks and other memory-sensitive data.
     */
    destroy(): void;
    private onModelDestroyed;
    /**
     * Starts listening to all events, as defined with `listenTo` and `listenToEventName`.
     */
    startListening(): void;
    /**
     * Stops listening to all events, as defined with `listenTo` and `listenToEventName`.
     */
    stopListening(): void;
    /**
     * Starts all model watchers, as defined with `watch`.
     */
    startWatchers(): void;
    /**
     * Stops all model watchers, as defined with `watch`
     */
    stopWatchers(): void;
    /**
     * Enables/disables the Component. If the property representing the enable state exists on the model, it will be
     * set to the new state. Otherwise, the enabled state will be kept internally.
     *
     * For the Component to become active, all of its ancestors need to be enabled as well.
     *
     * @param {boolean} enabled		The new enabled state.
     */
    enable(enabled?: boolean): void;
    /**
     * Updates the final enabled state of the Component, based on its own enabled state and that of its ancestors.
     * Will call `onEnabled` if the enabled state changes to `true`, and `onDisabled` if the enabled state changes to
     * `false`.
     * @protected
     */
    protected updateEnabledState(): void;
    /**
     * Concatenates the name of the Component with its GID between brackets, e.g.: "MyComponent (314)"
     */
    toString(): string;
    /**
     * Generates an object tree that can be conveniently logged for debugging.
     * @param {boolean} asReference		If set to `true`, will only log the component, gid and `_reference: true`.
     * 									This is to prevent infinite recursion.
     */
    toTree(asReference?: boolean): Record<string, any>;
    /**
     * Called when the scene loads. Allows Components to do some asynchronous tasks and notify when they're done.
     */
    onLoad(): Promise<void>;
    /**
     * Called when the scene starts (after everything was loaded).
     */
    onStart(): void;
    /**
     * Called when the Component is destroyed.
     */
    onDestroy(): void;
    /**
     * Called when the Component is enabled.
     */
    onEnable(): void;
    /**
     * Called when the Component is disabled.
     */
    onDisable(): void;
    /**
     * Called when the parent of the component is set or changed.
     */
    onSetParent(parent?: Component): void;
}
