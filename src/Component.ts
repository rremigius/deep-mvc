import {Container, inject, injectable, LazyServiceIdentifer} from "inversify";
import ComponentFactory from "@/Component/ComponentFactory";
import Log from "@/log";
import Loader from "deep-loader";
import EventListener from "@/EventListener";
import ComponentList from "@/Component/ComponentList";
import ComponentSlot from "@/Component/ComponentSlot";
import {alphanumeric, CollectionSchema, immediate, MozelSchema, PropertySchema, Registry, schema} from "mozel";
import ComponentModel from "@/ComponentModel";
import EventBus from "@/EventBus";
import EventEmitter, {callback, Events} from "@/EventEmitter";
import {isString} from 'lodash';
import Property, {PropertyValue} from "mozel/dist/Property";
import {Constructor} from "validation-kit";
import {LogLevel} from "log-control";
import PropertyWatcher, {PropertyChangeHandler, PropertyWatcherOptionsArgument} from "mozel/dist/PropertyWatcher";

const log = Log.instance("component");

export type ComponentConstructor<T extends Component> = {
	new (...args: any[]): T;
	Model:(typeof ComponentModel);
};

export type ComponentActionData<E> = E extends ComponentAction<infer D> ? D : object;
export class ComponentAction<T> {
	data:T;
	constructor(data:T) {
		this.data = data;
	}
}

export class ComponentEvent<T extends object> {
	origin?:Component;
	data:T;
	// TS: don't understand why {} would not be assignable to type T
	constructor(origin:Component|undefined, data:T = {} as any) {
		this.origin = origin;
		this.data = data;
	}
}
export type ComponentEventData<E> = E extends ComponentEvent<infer D> ? D : object;
export type ComponentSlotDefinition = {property:string, modelPath:string, ExpectedComponentClass:ComponentConstructor<any>};
export type ComponentListDefinition = {property:string, modelPath:string, ExpectedComponentClass:ComponentConstructor<any>};

export class ComponentEnabledEvent extends ComponentEvent<object> { }
export class ComponentDisabledEvent extends ComponentEvent<object> { }
export class ComponentEvents extends Events {
	enabled = this.$event(ComponentEnabledEvent)
	disabled = this.$event(ComponentDisabledEvent)

	constructor() {
		super(true);
	}
}

export class ComponentEnableAction extends ComponentAction<{enable:boolean}> { }
export class ComponentActions extends Events {
	$action<T>(ActionClass:Constructor<T>) {
		return this.$event(ActionClass);
	}

	enable = this.$action(ComponentEnableAction);
}

// DECORATORS

export function component<C extends Component, M extends C['model']>(
	modelPath:string|MozelSchema<M>,
	ExpectedComponentClass:ComponentConstructor<C>
) {
	return function (target: Component, propertyName: string) {
		if(!isString(modelPath)) modelPath = modelPath.$path;
		target.static.defineComponentSlot(propertyName, modelPath, ExpectedComponentClass);
	};
}

export function components<C extends Component, M extends C['model']>(
	modelPath:string|CollectionSchema<M>,
	ExpectedComponentClass:ComponentConstructor<C>
) {
	return function (target: Component, propertyName: string) {
		if(!isString(modelPath)) modelPath = modelPath.$path;
		target.static.defineComponentList(propertyName, modelPath, ExpectedComponentClass);
	}
}

@injectable()
export default class Component {
	static Model = ComponentModel; // should be set for each extending class

	static createFactory() {
		const factory = new ComponentFactory();
		if(this !== Component) factory.register(this);
		return factory;
	}

	private static _classComponentSlotDefinitions: ComponentSlotDefinition[] = [];
	private static _classComponentListDefinitions: ComponentListDefinition[] = [];

	public static get classComponentSlotDefinitions() {
		// Override _classPropertyDefinitions so this class has its own set and it will not add its properties to its parent
		if (!this.hasOwnProperty('_classComponentSlotDefinitions')) {
			this._classComponentSlotDefinitions = [];
		}
		return this._classComponentSlotDefinitions;
	}

	public static get classComponentListDefinitions() {
		// Override _classPropertyDefinitions so this class has its own set and it will not add its properties to its parent
		if (!this.hasOwnProperty('_classComponentListDefinitions')) {
			this._classComponentListDefinitions = [];
		}
		return this._classComponentListDefinitions;
	}

	static defineComponentSlot(property:string, modelPath:string, ExpectedComponentClass:ComponentConstructor<any>) {
		this.classComponentSlotDefinitions.push({property, modelPath, ExpectedComponentClass});
	}

	static defineComponentList(property:string, modelPath:string, ExpectedComponentClass:ComponentConstructor<any>) {
		this.classComponentListDefinitions.push({property, modelPath, ExpectedComponentClass});
	}

	readonly gid:alphanumeric;

	public readonly model:ComponentModel;
	readonly factory:ComponentFactory;
	readonly registry:Registry<Component>;
	readonly eventBus:EventBus;
	readonly dependencies:Container;

	_parent?:Component;
	get parent() { return this._parent }

	allChildren:Record<string, ComponentSlot<Component>|ComponentList<Component>> = {};

	loading:Loader;

	events!:ComponentEvents;
	actions!:ComponentActions;

	private lastReportedEnabledState?:boolean;

	private eventListeners:EventListener<EventEmitter<unknown>>[] = [];
	private watchers:PropertyWatcher[];
	private permanentWatchers:PropertyWatcher[];

	_started:boolean = false;
	private parentEnabled:boolean = false;

	protected initialized:boolean;

	get static() {
		return <typeof Component>this.constructor;
	}

	get enabled() {
		return this.started && this.model.enabled && this.parentEnabled;
	}

	get started() {
		return this._started;
	}

	get name() {
		return this.static.name;
	}

	get modelName() {
		return this.model.static.name;
	}

	constructor(
		// using LazyServiceIdentifier to prevent circular dependency problem
		@inject(new LazyServiceIdentifer(()=>ComponentModel)) model:ComponentModel,
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

		this.initialized = false;
		this.watchers = [];
		this.permanentWatchers = [];

		const name = this.toString();
		this.loading = new Loader(name);
		this.loading.log.setLevel(LogLevel.WARN);

		this.onSetupEventsAndActions();
		this.onBindActions();
		this.initClassDefinitions();
		this.onInit();

		this.initialized = true;
	}

	initClassDefinitions() {
		// To be called for each class on the prototype chain
		const _defineData = (Class: typeof Component) => {
			if (Class !== Component) {
				// Define class properties of parent class
				_defineData(Object.getPrototypeOf(Class));
			}
			// Define class properties of this class
			Class.classComponentSlotDefinitions.forEach(definition => {
				(this as any)[definition.property] = this.setupSubComponent(definition.modelPath, definition.ExpectedComponentClass);
			});
			Class.classComponentListDefinitions.forEach(definition => {
				(this as any)[definition.property] = this.setupSubComponents(definition.modelPath, definition.ExpectedComponentClass);
			});
		};
		_defineData(this.static);
	}

	onInit() {
		// For override
	}

	onSetupEventsAndActions() {
		this.events = new ComponentEvents();
		this.actions = new ComponentActions();
	}
	onBindActions() {
		this.actions.enable.on(action => this.enable(action.data.enable));
	}

	createWatcher<T extends PropertyValue>(path:string|PropertySchema<T>|MozelSchema<T>, handler:PropertyChangeHandler<T>, options?:PropertyWatcherOptionsArgument) {
		const finalPath = isString(path) ? path : path.$path;
		const allOptions = {
			...options,
			...{
				path:finalPath,
				handler:<PropertyChangeHandler<PropertyValue>><unknown>handler,
				immediate: true
			}
		}
		const watcher = new PropertyWatcher(this.model, allOptions);
		return watcher;
	}

	/**
	 * Watches model at the given path, but only when the Component is enabled.
	 * Will always use `immediate` option, so will check for changes every time the Component gets enabled.
	 * @param {string|PropertySchema<T>|MozelSchema<T>} path
	 * @param {PropertyChangeHandler<T>} handler
	 * @param {PropertyWatcherOptionsArgument} options
	 */
	watch<T extends PropertyValue>(path:string|PropertySchema<T>|MozelSchema<T>, handler:PropertyChangeHandler<T>, options?:PropertyWatcherOptionsArgument) {
		const watcher = this.createWatcher(path, handler, options);
		this.watchers.push(watcher);
		return watcher;
	}

	/**
	 * Watches model at the given path, whether the Component is enabled or disabled, until the Component is destroyed.
	 * Will start watching immediately, and fire first time when this method is called.
	 * @param {string|PropertySchema<T>|MozelSchema<T>} path
	 * @param {PropertyChangeHandler<T>} handler
	 * @param {PropertyWatcherOptionsArgument} options
	 */
	watchAlways<T extends PropertyValue>(path:string|PropertySchema<T>|MozelSchema<T>, handler:PropertyChangeHandler<T>, options?:PropertyWatcherOptionsArgument) {
		const watcher = this.createWatcher(path, handler, options);
		this.permanentWatchers.push(watcher);
		this.model.$addWatcher(watcher);
		return watcher;
	}

	setParent(parent?:Component) {
		this._parent = parent;
		this.updateEnabledState();
	}

	findParent(criteria:(component:Component) => boolean):Component|undefined {
		if(criteria(this)) {
			return this;
		}
		if(!this._parent) return;
		return this._parent.findParent(criteria);
	}

	getRootComponent():Component {
		if(!this._parent) return this;
		return this._parent.getRootComponent();
	}

	protected error(...args:unknown[]) {
		log.error(...args);
		return new Error(""+args[0]);
	}

	setupSubComponent<T extends Component>(
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

	setupSubComponents<P extends ComponentModel, T extends Component>(
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
	 * Listent to an event from the given source by its event name.
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
	 * @param event
	 * @param callback
	 */
	listenTo<T>(event:EventEmitter<T>, callback:callback<T>) {
		const eventListener = new EventListener(event, callback);
		eventListener.start();
		// TS: we can't use the event listener callbacks in this class anyway
		this.eventListeners.push(eventListener as EventListener<any>);
		return eventListener;
	}

	/**
	 * Runs the given callback on all children.
	 * @param callback
	 * @param [includeReferences]
	 */
	forEachChild(callback:(child:Component)=>void, includeReferences = false) {
		for(let path in this.allChildren) {
			const child = this.allChildren[path];

			if(!includeReferences && child.isReference) continue;

			if(child instanceof ComponentSlot) {
				const component = child.get();
				if(!component) continue;
				callback(component);
			} else if (child instanceof ComponentList) {
				child.each(callback);
			}
		}
	}

	resolveReferences() {
		for(let path in this.allChildren) {
			const sync = this.allChildren[path];
			sync.resolveReferences = true;
			sync.sync();
		}
		this.forEachChild(component => component.resolveReferences());
		this.onResolveReferences();
	}

	async load() {
		const start = Date.now();
		log.info(`${this} loading...`);

		let promise = this.onLoad();
		this.loading.start('main', undefined, promise);

		let i = 0;
		this.forEachChild((child:Component) => {
			let promise = child.load();
			this.loading.start('child-'+(i++), undefined, promise);
		});
		try {
			await this.loading.wait(undefined, 10000);
			const end = Date.now();
			log.info(`${this} loaded (${end-start} ms).`);
		} catch(e) {
			log.error(`${this} loading failed.`, e);
			throw e;
		}
	}
	start() {
		log.info(`${this} starting...`);
		this._started = true;
		this.onStart();

		this.forEachChild((child:Component) => {
			child.start();
		});

		this.model.$watch(schema(ComponentModel).enabled, this.updateEnabledState.bind(this), {immediate});
		log.info(`${this} started.`);
	}
	destroy() {
		this.stopListening();
		this.stopPermanentWatchers();

		this.onDestroy();
		this.forEachChild((child:Component) => {
			child.destroy();
		});
		log.info(`${this} destroyed.`);
	}
	stopListening() {
		this.eventListeners.forEach(listener => listener.stop());
	}
	startWatchers() {
		this.watchers.forEach(watcher => this.model.$addWatcher(watcher));
	}
	stopWatchers() {
		this.watchers.forEach(watcher => this.model.$removeWatcher(watcher));
	}
	stopPermanentWatchers() {
		this.permanentWatchers.forEach(watcher => this.model.$removeWatcher(watcher));
	}

	enable(enabled:boolean = true) {
		this.model.enabled = enabled;
		this.updateEnabledState();
	}
	updateEnabledState() {
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

	toString() {
		const name = `${this.name} (${this.gid})`;
		if(!this.parent) {
			return name;
		}
		return this.parent + '/' + name;
	}

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
				const component = child.get();
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

	onResolveReferences() {

	}

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
	 * Called whenever the Component is enabled
	 */
	onEnable() { }

	/**
	 * Called whenever the Component is disabled
	 */
	onDisable() {	}
}
