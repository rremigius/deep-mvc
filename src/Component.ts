import {Container, inject, injectable, LazyServiceIdentifer} from "inversify";
import ComponentFactory from "./Component/ComponentFactory";
import Log from "./log";
import Loader from "deep-loader";
import EventListener from "./EventListener";
import ComponentList from "./Component/ComponentList";
import ComponentSlot from "./Component/ComponentSlot";
import Mozel, {alphanumeric, CollectionSchema, immediate, MozelSchema, PropertySchema, Registry, schema} from "mozel";
import EventBus from "./EventBus";
import EventEmitter, {callback, Events} from "./EventEmitter";
import {isString} from 'lodash';
import Property, {PropertyValue} from "mozel/dist/Property";
import {Constructor, isSubClass} from "validation-kit";
import {LogLevel} from "log-control";
import PropertyWatcher, {PropertyChangeHandler, PropertyWatcherOptionsArgument} from "mozel/dist/PropertyWatcher";
import {DestroyedEvent} from "mozel/dist/Mozel";

const log = Log.instance("component");

export type ComponentConstructor<T extends Component> = {
	new (...args: any[]): T;
	Model:(typeof Mozel);
};

export type ComponentActionData<E> = E extends ComponentAction<infer D> ? D : object;

/**
 * Base class for Component Actions.
 */
export class ComponentAction<T extends object> {
	data:T;

	/**
	 * Payload of the event.
	 * @param {T} data
	 */
	constructor(data:T) {
		this.data = data;
	}
}

/**
 * Base class for Component Events
 */
export class ComponentEvent<T extends object> {
	origin?:Component;
	data:T;

	/**
	 *
	 * @param {Component} origin	The Component from which this event originates.
	 * @param {T} data				The event payload.
	 */
	constructor(origin:Component|undefined, data:T = {} as T) {
		this.origin = origin;
		this.data = data;
	}
}
export type ComponentEventData<E> = E extends ComponentEvent<infer D> ? D : object;
export type ComponentSlotDefinition = {property:string, modelPath:string, ExpectedComponentClass:ComponentConstructor<any>};
export type ComponentListDefinition = {property:string, modelPath:string, ExpectedComponentClass:ComponentConstructor<any>};

/**
 * Fires when the Component gets enabled.
 */
export class ComponentEnabledEvent extends ComponentEvent<object> { }

/**
 * Fires when the Component gets disabled.
 */
export class ComponentDisabledEvent extends ComponentEvent<object> { }

export class ComponentEvents extends Events {
	enabled = this.$event(ComponentEnabledEvent)
	disabled = this.$event(ComponentDisabledEvent)

	constructor() {
		super(true);
	}
}

/**
 * Action to enable/disable the Component.
 */
export class ComponentEnableAction extends ComponentAction<{enable:boolean}> { }

export class ComponentActions extends Events {
	$action<T>(ActionClass:Constructor<T>) {
		return this.$event(ActionClass);
	}

	enable = this.$action(ComponentEnableAction);
}

// DECORATORS

/**
 * Defines a ComponentSlot for the current Component class, to instantiate or find the child component corresponding
 * to the model at the given path.
 * @param modelPath					Path of the model based on which the child component should be resolved.
 * 									Can be a string, or a Schema provided by `schema(Model)`.
 * @param ExpectedComponentClass	Component class that is expected to be instantiated (runtime verification).
 */
export function component<C extends Component, M extends C['model']>(
	modelPath:string|MozelSchema<M>,
	ExpectedComponentClass:ComponentConstructor<C>
) {
	return function (target: Component, propertyName: string) {
		if(!isString(modelPath)) modelPath = modelPath.$path;
		target.static.defineComponentSlot(propertyName, modelPath, ExpectedComponentClass);
	};
}

/**
 * Defines a ComponentList for the current Component class, to instantiate or find the child components corresponding
 * to the model at the given path.
 * @param modelPath					Path of the model based on which the child components should be resolved.
 * 									Can be a string, or a Schema provided by `schema(Model)`.
 * @param ExpectedComponentClass	Component class that is expected to be instantiated (runtime verification).
 */
export function components<C extends Component, M extends C['model']>(
	modelPath:string|CollectionSchema<M>,
	ExpectedComponentClass:ComponentConstructor<C>
) {
	return function (target: Component, propertyName: string) {
		if(!isString(modelPath)) modelPath = modelPath.$path;
		target.static.defineComponentList(propertyName, modelPath, ExpectedComponentClass);
	}
}

/**
 * Base Component class. Designed to be a functional counterpart of a data model.
 */
@injectable()
export default class Component {
	static Model = Mozel; // should be set for each extending class
	static Events = ComponentEvents;
	static Actions = ComponentActions;

	/**
	 * Creates a ComponentFactory, with the current Component class already registered.
	 */
	static createFactory() {
		const factory = new ComponentFactory();
		if(this !== Component) factory.register(this);
		return factory;
	}

	private static _classComponentSlotDefinitions: ComponentSlotDefinition[] = [];
	private static _classComponentListDefinitions: ComponentListDefinition[] = [];

	/**
	 * Gets the definitions for ComponentSlots for this class.
	 */
	public static get classComponentSlotDefinitions() {
		// Override _classPropertyDefinitions so this class has its own set and it will not add its properties to its parent
		if (!this.hasOwnProperty('_classComponentSlotDefinitions')) {
			this._classComponentSlotDefinitions = [];
		}
		return this._classComponentSlotDefinitions;
	}

	/**
	 * Gets the definitions for ComponentLists for this class.
	 */
	public static get classComponentListDefinitions() {
		// Override _classPropertyDefinitions so this class has its own set and it will not add its properties to its parent
		if (!this.hasOwnProperty('_classComponentListDefinitions')) {
			this._classComponentListDefinitions = [];
		}
		return this._classComponentListDefinitions;
	}

	/**
	 * Defines a ComponentSlot for the current Component class, to instantiate or find the child component corresponding
	 * to the model at the given path.
	 * @param {string} property			Name of the property by which the ComponentSlot can be accessed.
	 * @param modelPath					Path of the model based on which the child component should be resolved..
	 * 									Can be a string, or a Schema provided by `schema(Model)`.
	 * @param ExpectedComponentClass	Component class that is expected to be instantiated (runtime verification).
	 */
	static defineComponentSlot(property:string, modelPath:string, ExpectedComponentClass:ComponentConstructor<any>) {
		this.classComponentSlotDefinitions.push({property, modelPath, ExpectedComponentClass});
	}

	/**
	 * Defines a ComponentList for the current Component class, to instantiate or find the child components corresponding
	 * to the model at the given path.
	 * @param {string} property			Name of the property by which the ComponentList can be accessed.
	 * @param modelPath					Path of the model based on which the child components should be resolved.
	 * 									Can be a string, or a Schema provided by `schema(Model)`.
	 * @param ExpectedComponentClass	Component class that is expected to be instantiated (runtime verification).
	 */
	static defineComponentList(property:string, modelPath:string, ExpectedComponentClass:ComponentConstructor<any>) {
		this.classComponentListDefinitions.push({property, modelPath, ExpectedComponentClass});
	}

	/** Unique identifier shared only between model and all its components */
	readonly gid:alphanumeric;

	/** The model on which this Component is based */
	public readonly model:Mozel;
	/** The factory that created this Component, and is used to create child Components */
	readonly factory:ComponentFactory;
	/** The registry in which this Component is registered, and which can be used to find other Components */
	readonly registry:Registry<Component>;
	/** The eventBus to which all Components created by the same factory are connected and can send and receive events to/from */
	readonly eventBus:EventBus;
	/** The Inversify dependency Container to which all Component classes, factory, registry, eventBus and other common services are bound */
	readonly dependencies:Container;

	private _parent?:Component;
	/** The parent Component to which this Component is a direct child */
	get parent() { return this._parent }

	/** Contains all events that can be fired and subscribed to on this Component. */
	events!:ComponentEvents;
	/** Contains all actions that can be called on this Component. */
	actions!:ComponentActions;

	private componentSlotDefinitions:Record<string, ComponentSlotDefinition> = {};
	private componentListDefinitions:Record<string, ComponentListDefinition> = {};
	private allChildren:Record<string, ComponentSlot<Component>|ComponentList<Component>> = {};
	private loader:Loader;
	private lastReportedEnabledState?:boolean;
	private eventListeners:EventListener<EventEmitter<unknown>>[] = [];
	private watchers:PropertyWatcher[];
	private permanentWatchers:PropertyWatcher[];
	private initialized:boolean;
	private parentEnabled:boolean = true;

	/** Property name of the model that represents the enabled state of the Component */
	protected enabledProperty;

	get static() {
		return <typeof Component>this.constructor;
	}

	private _enabled:boolean = true;
	get enabled() {
		// If model has 'enabled' property, we use that. Otherwise, we use the Component's own `_enabled` property.
		const thisEnabled = this.hasEnabledPropertyInModel()
			? this.model.$get(this.enabledProperty) !== false
			: this._enabled;
		return this.started && thisEnabled && this.parentEnabled;
	}

	private _started:boolean = false;
	/** Whether or not the Component has been started (with the start() method)*/
	get started() {
		return this._started;
	}

	/** Component class name */
	get name() {
		return this.static.name;
	}

	/** Model name */
	get modelName() {
		return this.model.static.name;
	}

	/** Returns the promise for initial loading */
	get loading() {
		return this.loader.wait();
	}

	constructor(
		// using LazyServiceIdentifier to prevent circular dependency problem
		@inject(new LazyServiceIdentifer(()=>Mozel)) model:Mozel,
		// using LazyServiceIdentifier to prevent circular dependency problem
		@inject(new LazyServiceIdentifer(()=>ComponentFactory)) componentFactory:ComponentFactory,
		@inject(Registry) registry:Registry<Component>,
		@inject(EventBus) eventBus:EventBus,
		@inject(Container) dependencies:Container
	) {
		if(!this.static.Model || !(model instanceof this.static.Model)) {
			throw new Error(`Invalid Model provided to Component '${this.static.name}'.`);
		}
		this.model = model;
		this.gid = model.gid;
		this.factory = componentFactory;
		this.registry = registry;
		this.eventBus = eventBus;
		this.dependencies = dependencies;
		this.enabledProperty = 'enabled';

		this.initialized = false;
		this.watchers = [];
		this.permanentWatchers = [];

		const name = this.toString();
		this.loader = new Loader(name);
		this.loader.log.setLevel(LogLevel.WARN);

		this.model.$on(DestroyedEvent, () => this.onModelDestroyed());

		this.setupActionsAndEvents();
		this.initClassDefinitions();
		this.onInit();

		this.initialized = true;
	}

	/**
	 * Tells whether or not the model has the property that represents the enabled state of the Component.
	 * @return {boolean} True if the property exists on the model.
	 */
	hasEnabledPropertyInModel() {
		return this.model.$has(this.enabledProperty);
	}

	private collectClassDefinitions() {
		const _collectClassDefinitions = (Class: typeof Component) => {
			// First collect parent class definitions
			if(Class !== Component) {
				_collectClassDefinitions(Object.getPrototypeOf(Class));
			}
			// Then collect this class' definitions (allow override)
			Class.classComponentSlotDefinitions.forEach(definition => {
				this.componentSlotDefinitions[definition.property] = definition;
			});
			Class.classComponentListDefinitions.forEach(definition => {
				this.componentListDefinitions[definition.property] = definition;
			});
		};
		_collectClassDefinitions(this.static);

	}
	private initClassDefinitions() {
		// First collect all definitions
		this.collectClassDefinitions();

		for(let property in this.componentSlotDefinitions) {
			const definition = this.componentSlotDefinitions[property];
			(this as any)[definition.property] = this.setupSubComponent(definition.modelPath, definition.ExpectedComponentClass);
		}
		for(let property in this.componentListDefinitions) {
			const definition = this.componentListDefinitions[property];
			(this as any)[definition.property] = this.setupSubComponents(definition.modelPath, definition.ExpectedComponentClass);
		}
	}

	eachComponentSlot(callback: (slot:ComponentSlot<Component>)=>void) {
		for(let property in this.componentSlotDefinitions) {
			const definition = this.componentSlotDefinitions[property];
			callback((this as any)[definition.property]);
		}
	}

	eachComponentList(callback: (list:ComponentList<Component>)=>void) {
		for(let property in this.componentListDefinitions) {
			const definition = this.componentListDefinitions[property];
			callback((this as any)[definition.property]);
		}
	}

	/**
	 * Initializes the Component. Called from the constructor.
	 * @protected
	 */
	protected onInit() {
		this.actions.enable.on(action => this.enable(action.data.enable));
	}

	/**
	 * Sets up the actions and events as defined by the static properties `Actions` and `Events`.
	 */
	protected setupActionsAndEvents() {
		this.events = new this.static.Events();
		this.actions = new this.static.Actions();
	}

	/**
	 * Calls an action on the Component by its name. Will throw an error if the action does not exist.
	 * @param {string} name		The name of the action (usually the Action class name).
	 * @param payload			The payload required by the specified action.
	 */
	callAction(name:string, payload:any) {
		let action;
		try {
			action = this.actions.$get(name);
		} catch(e) {
			throw new Error(`Unknown action '${name}' on ${this.static.name}.`);
		}
		const ActionClass = action.type;
		if(!isSubClass(ActionClass, ComponentAction)) {
			throw new Error("Trigger action is not a ComponentAction.");
		}
		this.actions.$fire(name, new ActionClass(payload));
	}

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
	public createWatcher<T extends PropertyValue>(path:string|PropertySchema<T>|MozelSchema<T>, handler:PropertyChangeHandler<T>, options?:PropertyWatcherOptionsArgument) {
		const finalPath = isString(path) ? path : path.$path;
		const allOptions = {
			...options,
			...{
				path:finalPath,
				handler:<PropertyChangeHandler<PropertyValue>><unknown>handler,
				immediate: true
			}
		}
		return new PropertyWatcher(this.model, allOptions);
	}

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
	watch<T extends PropertyValue>(path:string|PropertySchema<T>|MozelSchema<T>, handler:PropertyChangeHandler<T>, options?:PropertyWatcherOptionsArgument) {
		const watcher = this.createWatcher(path, handler, options);
		this.watchers.push(watcher);
		return watcher;
	}

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
	watchAlways<T extends PropertyValue>(path:string|PropertySchema<T>|MozelSchema<T>, handler:PropertyChangeHandler<T>, options?:PropertyWatcherOptionsArgument) {
		const watcher = this.createWatcher(path, handler, options);
		this.permanentWatchers.push(watcher);
		this.model.$addWatcher(watcher);
		return watcher;
	}

	/**
	 * Sets the parentof this Component.
	 * @param {Component} parent
	 */
	setParent(parent?:Component) {
		this._parent = parent;
		this.updateEnabledState();
		this.onSetParent(parent);
	}

	/**
	 * Finds the first parent up the hierarchy that matches the given conditions.
	 * @param {(component:Component)=>boolean}	criteria	Function to evaluated whether a component matches the conditions.
	 */
	findParent(criteria:(component:Component) => boolean):Component|undefined {
		if(criteria(this)) {
			return this;
		}
		if(!this._parent) return;
		return this._parent.findParent(criteria);
	}

	/**
	 * Gets the root Component of the hierarchy.
	 */
	getRootComponent():Component {
		if(!this._parent) return this;
		return this._parent.getRootComponent();
	}

	/**
	 * Generates and log an Error.
	 * @param args	Any number of arguments can be logged; only the first argument will be used as the Error message.
	 * @protected
	 */
	protected error(...args:unknown[]) {
		log.error(...args);
		return new Error(""+args[0]);
	}

	protected setupSubComponent<T extends Component>(
		modelPath:string|Property,
		ComponentClass:ComponentConstructor<T>
	) {
		if(modelPath instanceof Property) {
			modelPath = modelPath.getPathFrom(this.model);
		}
		const sync = new ComponentSlot<T>(this, this.model, modelPath, ComponentClass.Model, ComponentClass, this.factory);
		sync.startWatching();

		this.allChildren[modelPath] = sync as unknown as ComponentSlot<Component>;

		return sync;
	}

	protected setupSubComponents<P extends Mozel, T extends Component>(
		modelPath:string|Property,
		ComponentClass:ComponentConstructor<T>
	) {
		if(modelPath instanceof Property) {
			modelPath = modelPath.getPathFrom(this.model);
		}
		const list = new ComponentList<T>(this, this.model, modelPath, ComponentClass.Model, ComponentClass, this.factory);
		list.startWatching();

		this.allChildren[modelPath] = list as unknown as ComponentList<Component>;

		return list;
	}

	/**
	 * Listens to an event from the given source by its event name.
	 * @param {Component} source
	 * @param {string} eventName
	 * @param {callback} callback
	 */
	listenToEventName(source:Events, eventName:string, callback:callback<unknown>) {
		const event = source.$get(eventName);
		this.listenTo(event, callback);
	}

	/**
	 * Starts listening to an event of the target EventEmitterr, storing the callback locally to be destroyed and
	 * unsubscribed when the Component is destroyed.
	 * @param {EventEmitter<T>>} event
	 * @param {callback<T>} callback
	 */
	listenTo<T>(event:EventEmitter<T>, callback:callback<T>) {
		const eventListener = new EventListener(event, callback);
		eventListener.start();
		// TS: we can't use the event listener callbacks in this class anyway
		this.eventListeners.push(eventListener as EventListener<any>);
		return eventListener;
	}

	/**
	 * Runs the given callback on all children, whether in ComponentSlots or ComponentLists.
	 * @param {Function} callback	Callback that takes the Component.
	 * @param [includeReferences]	If set to `true`, will also run the callback on Components that are references.
	 * 								Defaults to `false`.
	 */
	forEachChild(callback:(child:Component)=>void, includeReferences = false) {
		for(let path in this.allChildren) {
			const child = this.allChildren[path];

			if(!includeReferences && child.isReference) continue;

			if(child instanceof ComponentSlot) {
				const component = child.current;
				if(!component) continue;
				callback(component);
			} else if (child instanceof ComponentList) {
				child.each(callback);
			}
		}
	}

	/**
	 * Resolves all references of defined ComponentSlots and ComponentLists.
	 */
	resolveReferences() {
		for(let path in this.allChildren) {
			const sync = this.allChildren[path];
			sync.resolveReferences = true;
			sync.sync();
		}
		this.forEachChild(component => component.resolveReferences());
	}

	/**
	 * Performs initial asynchronous loading of the Component.
	 */
	async load() {
		const start = Date.now();
		log.info(`${this} loading...`);

		let promise = this.onLoad();
		this.loader.start('main', undefined, promise);

		let i = 0;
		this.forEachChild((child:Component) => {
			let promise = child.load();
			this.loader.start('child-'+(i++), undefined, promise);
		});
		try {
			await this.loader.wait(undefined, 10000);
			const end = Date.now();
			log.info(`${this} loaded (${end-start} ms).`);
		} catch(e) {
			log.error(`${this} loading failed.`, e);
			throw e;
		}
	}

	/**
	 * Starts the Component. Unless the Component is disabled, it will be active directly afterwards.
	 */
	start() {
		log.info(`${this} starting...`);
		this._started = true;
		this.onStart();

		this.forEachChild((child:Component) => {
			child.start();
		});

		log.info(`${this} started.`);

		if(this.hasEnabledPropertyInModel()) {
			log.info(`Watching '${this.enabledProperty}' property for enabled/disabled state.`);
			this.watchAlways(this.enabledProperty, this.updateEnabledState.bind(this), {immediate});
		} else {
			this.updateEnabledState();
		}
	}

	/**
	 * Destroys the model, triggering the destruction of all related components, including this one.
	 * Will clean up registered callbacks and other memory-sensitive data.
	 */
	destroy() {
		this.model.$destroy();
	}

	private onModelDestroyed() {
		this.stopListening();
		this.permanentWatchers.forEach(watcher => this.model.$removeWatcher(watcher));

		this.onDestroy();
		log.info(`${this} destroyed.`);
	}

	/**
	 * Starts listening to all events, as defined with `listenTo` and `listenToEventName`.
	 */
	startListening() {
		this.eventListeners.forEach(listener => listener.start());
	}
	/**
	 * Stops listening to all events, as defined with `listenTo` and `listenToEventName`.
	 */
	stopListening() {
		this.eventListeners.forEach(listener => listener.stop());
	}

	/**
	 * Starts all model watchers, as defined with `watch`.
	 */
	startWatchers() {
		this.watchers.forEach(watcher => this.model.$addWatcher(watcher));
	}

	/**
	 * Stops all model watchers, as defined with `watch`
	 */
	stopWatchers() {
		this.watchers.forEach(watcher => this.model.$removeWatcher(watcher));
	}

	/**
	 * Enables/disables the Component. If the property representing the enable state exists on the model, it will be
	 * set to the new state. Otherwise, the enabled state will be kept internally.
	 *
	 * For the Component to become active, all of its ancestors need to be enabled as well.
	 *
	 * @param {boolean} enabled		The new enabled state.
	 */
	enable(enabled:boolean = true) {
		if(this.hasEnabledPropertyInModel()) {
			this.model.$set(this.enabledProperty, enabled);
		} else {
			this._enabled = enabled;
		}
		this.updateEnabledState();
	}

	/**
	 * Updates the final enabled state of the Component, based on its own enabled state and that of its ancestors.
	 * Will call `onEnabled` if the enabled state changes to `true`, and `onDisabled` if the enabled state changes to
	 * `false`.
	 * @protected
	 */
	protected updateEnabledState() {
		if(!this.started) return;

		this.parentEnabled = !this.parent ? true : this.parent.enabled;

		if(this.enabled && this.lastReportedEnabledState !== true) {
			log.info(`${this} enabled.`);
			this.lastReportedEnabledState = true;
			this.onEnable();
			this.events.enabled.fire(new ComponentEnabledEvent(this));
			this.startWatchers();
		} else if (!this.enabled && this.lastReportedEnabledState !== false) {
			log.info(`${this} disabled.`);
			this.lastReportedEnabledState = false;
			this.onDisable();
			this.events.disabled.fire(new ComponentDisabledEvent(this));
			this.stopWatchers();
		}

		this.forEachChild(child => child.updateEnabledState());
	}

	/**
	 * Concatenates the name of the Component with its GID between brackets, e.g.: "MyComponent (314)"
	 */
	toString() {
		const name = `${this.name} (${this.gid})`;
		if(!this.parent) {
			return name;
		}
		return this.parent + '/' + name;
	}

	/**
	 * Generates an object tree that can be conveniently logged for debugging.
	 * @param {boolean} asReference		If set to `true`, will only log the component, gid and `_reference: true`.
	 * 									This is to prevent infinite recursion.
	 */
	toTree(asReference = false) {
		const tree:Record<string, any> = {
			_this: this,
			gid: this.gid
		};
		if(asReference) {
			tree._reference = true;
			return tree;
		}
		for(let path in this.allChildren) {
			const child = this.allChildren[path];
			if(child instanceof ComponentSlot) {
				const component = child.current
				tree[path] = component ? component.toTree(child.isReference) : undefined;
			} else if (child instanceof ComponentList) {
				const list:object[] = [];
				child.each(component => list.push(component.toTree(child.isReference)));
				tree[path] = list;
			}
		}
		return tree;
	}

	/*
	Life cycle hooks
	 */

	/**
	 * Called when the scene loads. Allows Components to do some asynchronous tasks and notify when they're done.
	 */
	async onLoad() {}

	/**
	 * Called when the scene starts (after everything was loaded).
	 */
	onStart() {}

	/**
	 * Called when the Component is destroyed.
	 */
	onDestroy() {}

	/**
	 * Called when the Component is enabled.
	 */
	onEnable() { }

	/**
	 * Called when the Component is disabled.
	 */
	onDisable() {	}

	/**
	 * Called when the parent of the component is set or changed.
	 */
	onSetParent(parent?:Component) { }
}
