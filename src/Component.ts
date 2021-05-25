import {Container, inject, injectable, LazyServiceIdentifer} from "inversify";
import ComponentFactory from "@/Component/ComponentFactory";
import Log from "@/log";
import Loader from "deep-loader";
import EventListener from "@/EventListener";
import ComponentList from "@/Component/ComponentList";
import ComponentSlot from "@/Component/ComponentSlot";
import {alphanumeric, CollectionSchema, immediate, MozelSchema, Registry, schema} from "mozel";
import ComponentModel from "@/ComponentModel";
import EventBus from "@/EventBus";
import EventEmitter, {callback, Events} from "@/EventEmitter";
import {isString} from 'lodash';
import Property from "mozel/dist/Property";
import {Constructor} from "validation-kit";
import {LogLevel} from "log-control";

const log = Log.instance("component");

export type ComponentConstructor<T extends Component> = {
	new (...args: any[]): T;
	ModelClass:(typeof ComponentModel);
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
export type ComponenetEventData<E> = E extends ComponentEvent<infer D> ? D : object;
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

export class ComponentActions extends Events {
	$action<T>(ActionClass:Constructor<T>) {
		return this.$event(ActionClass);
	}
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
	static ModelClass:(typeof ComponentModel) = ComponentModel; // should be set for each extending class

	static createFactory() {
		return new ComponentFactory();
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

	events = new ComponentEvents();
	actions = new ComponentActions();

	private eventListeners:EventListener<EventEmitter<unknown>>[] = [];

	_started:boolean = false;
	private parentEnabled:boolean = false;

	protected initialized:boolean;

	constructor(
		// using LazyServiceIdentifier to prevent circular dependency problem
		@inject(new LazyServiceIdentifer(()=>ComponentModel)) model:ComponentModel,
		// using LazyServiceIdentifier to prevent circular dependency problem
		@inject(new LazyServiceIdentifer(()=>ComponentFactory)) componentFactory:ComponentFactory,
		@inject(Registry) registry:Registry<Component>,
		@inject(EventBus) eventBus:EventBus,
		@inject(Container) dependencies:Container
	) {
		if(!this.static.ModelClass || !(model instanceof this.static.ModelClass)) {
			throw new Error(`Invalid Model provided to Component '${this.static.name}'.`);
		}
		this.model = model;
		this.gid = model.gid;
		this.factory = componentFactory;
		this.registry = registry;
		this.eventBus = eventBus;
		this.dependencies = dependencies;

		this.initialized = false;

		const name = this.toString();
		this.loading = new Loader(name);
		this.loading.log.setLevel(LogLevel.WARN);

		this.initClassDefinitions();
		this.init(model);

		this.model.$watch(schema(ComponentModel).enabled, enabled => {
			if(this.initialized) this.enable(enabled);
		});

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

	init(model:ComponentModel) {
		// For override
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
		const sync = new ComponentSlot<T>(this, this.model, modelPath, ComponentClass.ModelClass, ComponentClass, this.factory);
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
		const list = new ComponentList<T>(this, this.model, modelPath, ComponentClass.ModelClass, ComponentClass, this.factory);
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
			log.info(`${this} loaded.`);
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
	}
	destroy() {
		this.stopListening();

		this.onDestroy();
		this.forEachChild((child:Component) => {
			child.destroy();
		});
	}
	stopListening() {
		this.eventListeners.forEach(listener => listener.stop());
	}

	enable(enabled:boolean = true) {
		this.model.enabled = enabled;
	}
	updateEnabledState() {
		const wasEnabled = this.enabled;
		this.parentEnabled = !this.parent ? true : this.parent.enabled;

		if(!wasEnabled && this.enabled) {
			log.info(`${this} enabled.`);
			this.onEnable();
			this.events.enabled.fire(new ComponentEnabledEvent(this));
		} else if (wasEnabled && !this.enabled) {
			log.info(`${this} disabled.`);
			this.onDisable();
			this.events.disabled.fire(new ComponentDisabledEvent(this));
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
