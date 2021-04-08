import {Container, inject, injectable, LazyServiceIdentifer} from "inversify";
import ControllerFactory, {ControllerModelSymbol} from "@/Controller/ControllerFactory";
import Log from "@/log";
import Loader from "deep-loader";
import EventListener from "@/EventListener";
import ViewFactory from "@/Engine/views/ViewFactory";
import ControllerList from "@/Controller/ControllerList";
import ControllerSlot from "@/Controller/ControllerSlot";
import {alphanumeric, CollectionSchema, immediate, MozelSchema, Registry, schema} from "mozel";
import ControllerModel from "@/ControllerModel";
import EventBus from "@/EventBus";
import EventEmitter, {callback, Events} from "@/EventEmitter";
import {isString} from 'lodash';
import Property from "mozel/dist/Property";
import {Constructor} from "validation-kit";
import {LogLevel} from "log-control";

const log = Log.instance("controller");

export type ControllerConstructor<T extends Controller> = {
	new (...args: any[]): T;
	ModelClass:(typeof ControllerModel);
};

export type ControllerActionData<E> = E extends ControllerAction<infer D> ? D : object;
export class ControllerAction<T> {
	data:T;
	constructor(data:T) {
		this.data = data;
	}
}

export class ControllerEvent<T extends object> {
	origin?:Controller;
	data:T;
	// TS: don't understand why {} would not be assignable to type T
	constructor(origin:Controller|undefined, data:T = {} as any) {
		this.origin = origin;
		this.data = data;
	}
}
export type ControllerEventData<E> = E extends ControllerEvent<infer D> ? D : object;
export type ControllerSlotDefinition = {property:string, modelPath:string, ExpectedControllerClass:ControllerConstructor<any>};
export type ControllerListDefinition = {property:string, modelPath:string, ExpectedControllerClass:ControllerConstructor<any>};

export class ControllerEnabledEvent extends ControllerEvent<object> { }
export class ControllerDisabledEvent extends ControllerEvent<object> { }

export class ControllerEvents extends Events {
	enabled = this.$event(ControllerEnabledEvent)
	disabled = this.$event(ControllerDisabledEvent)

	constructor() {
		super(true);
	}
}

export class ControllerActions extends Events {
	$action<T>(ActionClass:Constructor<T>) {
		return this.$event(ActionClass);
	}
}

// DECORATORS

export function controller<C extends Controller, M extends C['model']>(
	modelPath:string|MozelSchema<M>,
	ExpectedControllerClass:ControllerConstructor<C>
) {
	return function (target: Controller, propertyName: string) {
		if(!isString(modelPath)) modelPath = modelPath.$path;
		target.static.defineControllerSlot(propertyName, modelPath, ExpectedControllerClass);
	};
}

export function controllers<C extends Controller, M extends C['model']>(
	modelPath:string|CollectionSchema<M>,
	ExpectedControllerClass:ControllerConstructor<C>
) {
	return function (target: Controller, propertyName: string) {
		if(!isString(modelPath)) modelPath = modelPath.$path;
		target.static.defineControllerList(propertyName, modelPath, ExpectedControllerClass);
	}
}

@injectable()
export default class Controller {
	static ModelClass:(typeof ControllerModel) = ControllerModel; // should be set for each extending class

	static createFactory() {
		return new ControllerFactory();
	}

	private static _classControllerSlotDefinitions: ControllerSlotDefinition[] = [];
	private static _classControllerListDefinitions: ControllerListDefinition[] = [];

	public static get classControllerSlotDefinitions() {
		// Override _classPropertyDefinitions so this class has its own set and it will not add its properties to its parent
		if (!this.hasOwnProperty('_classControllerSlotDefinitions')) {
			this._classControllerSlotDefinitions = [];
		}
		return this._classControllerSlotDefinitions;
	}

	public static get classControllerListDefinitions() {
		// Override _classPropertyDefinitions so this class has its own set and it will not add its properties to its parent
		if (!this.hasOwnProperty('_classControllerListDefinitions')) {
			this._classControllerListDefinitions = [];
		}
		return this._classControllerListDefinitions;
	}

	static defineControllerSlot(property:string, modelPath:string, ExpectedControllerClass:ControllerConstructor<any>) {
		this.classControllerSlotDefinitions.push({property, modelPath, ExpectedControllerClass});
	}

	static defineControllerList(property:string, modelPath:string, ExpectedControllerClass:ControllerConstructor<any>) {
		this.classControllerListDefinitions.push({property, modelPath, ExpectedControllerClass});
	}

	readonly gid:alphanumeric;

	public readonly model:ControllerModel;
	readonly factory:ControllerFactory;
	readonly registry:Registry<Controller>;
	readonly eventBus:EventBus;
	readonly viewFactory:ViewFactory;
	readonly dependencies:Container;

	_parent?:Controller;
	get parent() { return this._parent }
	children:Record<string, ControllerSlot<Controller>|ControllerList<Controller>> = {};

	loading:Loader;

	events = new ControllerEvents();
	actions = new ControllerActions();

	private eventListeners:EventListener<EventEmitter<unknown>>[] = [];

	_started:boolean = false;
	private parentEnabled:boolean = false;

	protected initialized:boolean;

	constructor(
		// using LazyServiceIdentifier to prevent circular dependency problem
		@inject(new LazyServiceIdentifer(()=>ControllerModel)) model:ControllerModel,
		// using LazyServiceIdentifier to prevent circular dependency problem
		@inject(new LazyServiceIdentifer(()=>ControllerFactory)) controllerFactory:ControllerFactory,
		@inject(Registry) registry:Registry<Controller>,
		@inject(EventBus) eventBus:EventBus,
		@inject(ViewFactory) viewFactory:ViewFactory,
		@inject(Container) dependencies:Container
	) {
		if(!this.static.ModelClass || !(model instanceof this.static.ModelClass)) {
			throw new Error(`Invalid Model provided to Controller '${this.static.name}'.`);
		}
		this.model = model;
		this.gid = model.gid;
		this.factory = controllerFactory;
		this.registry = registry;
		this.eventBus = eventBus;
		this.viewFactory = viewFactory;
		this.dependencies = dependencies;

		this.initialized = false;

		const name = this.toString();
		this.loading = new Loader(name);
		this.loading.log.setLevel(LogLevel.WARN);

		this.initClassDefinitions();
		this.init(model);

		this.model.$watch(schema(ControllerModel).enabled, enabled => {
			if(this.initialized) this.enable(enabled);
		});

		this.initialized = true;
	}

	initClassDefinitions() {
		// To be called for each class on the prototype chain
		const _defineData = (Class: typeof Controller) => {
			if (Class !== Controller) {
				// Define class properties of parent class
				_defineData(Object.getPrototypeOf(Class));
			}
			// Define class properties of this class
			Class.classControllerSlotDefinitions.forEach(definition => {
				(this as any)[definition.property] = this.controller(definition.modelPath, definition.ExpectedControllerClass);
			});
			Class.classControllerListDefinitions.forEach(definition => {
				(this as any)[definition.property] = this.controllers(definition.modelPath, definition.ExpectedControllerClass);
			});
		};
		_defineData(this.static);
	}

	get static() {
		return <typeof Controller>this.constructor;
	}

	get enabled() {
		return this.model.enabled && this.parentEnabled;
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

	init(model:ControllerModel) {
		// For override
	}

	setParent(parent?:Controller) {
		this._parent = parent;
		this.updateEnabledState();
	}

	protected error(...args:unknown[]) {
		log.error(...args);
		return new Error(""+args[0]);
	}

	controller<T extends Controller>(
		modelPath:string|Property,
		ControllerClass:ControllerConstructor<T>
	) {
		if(modelPath instanceof Property) {
			modelPath = modelPath.getPathFrom(this.model);
		}
		const sync = new ControllerSlot<T>(this, this.model, modelPath, ControllerClass.ModelClass, ControllerClass, this.factory);
		sync.startWatching();

		this.children[modelPath] = sync as unknown as ControllerSlot<Controller>;

		return sync;
	}

	controllers<P extends ControllerModel, T extends Controller>(
		modelPath:string|Property,
		ControllerClass:ControllerConstructor<T>
	) {
		if(modelPath instanceof Property) {
			modelPath = modelPath.getPathFrom(this.model);
		}
		const list = new ControllerList<T>(this, this.model, modelPath, ControllerClass.ModelClass, ControllerClass, this.factory);
		list.startWatching();

		this.children[modelPath] = list as unknown as ControllerList<Controller>;

		return list;
	}

	/**
	 * Listent to an event from the given source by its event name.
	 * @param {Controller} source
	 * @param {string} eventName
	 * @param {callback} callback
	 */
	listenToEventName(source:Events, eventName:string, callback:callback<unknown>) {
		const event = source.$get(eventName);
		this.listenTo(event, callback);
	}

	/**
	 * Starts listening to an event of the target EventEmitterr, storing the callback locally to be destroyed and
	 * unsubscribed when the Controller is destroyed.
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
	forEachChild(callback:(child:Controller)=>void, includeReferences = false) {
		for(let path in this.children) {
			const child = this.children[path];

			if(!includeReferences && child.isReference) continue;

			if(child instanceof ControllerSlot) {
				const controller = child.get();
				if(!controller) continue;
				callback(controller);
			} else if (child instanceof ControllerList) {
				child.each(callback);
			}
		}
	}

	resolveReferences() {
		for(let path in this.children) {
			const sync = this.children[path];
			sync.resolveReferences = true;
			sync.sync();
		}
		this.forEachChild(controller => controller.resolveReferences());
	}

	async load() {
		log.info(`${this} loading...`);
		let promise = this.onLoad();
		this.loading.start('main', undefined, promise);
		let i = 0;
		this.forEachChild((child:Controller) => {
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

		this.forEachChild((child:Controller) => {
			child.start();
		});

		this.model.$watch(schema(ControllerModel).enabled, this.onModelEnableChanged.bind(this), {immediate});
	}
	destroy() {
		this.stopListening();

		this.onDestroy();
		this.forEachChild((child:Controller) => {
			child.destroy();
		});
	}
	stopListening() {
		this.eventListeners.forEach(listener => listener.stop());
	}

	enable(enabled:boolean = true) {
		this.model.enabled = enabled;
	}
	private onModelEnableChanged(enabled:boolean) {
		if(!enabled) {
			log.info(`${this} disabled.`);
			this.onDisable();
			this.events.disabled.fire(new ControllerDisabledEvent(this));
		} else {
			log.info(`${this} enabled.`);
			this.onEnable();
			this.events.enabled.fire(new ControllerEnabledEvent(this));
		}
		this.updateEnabledState();
		this.forEachChild((child:Controller) => {
			child.updateEnabledState();
		});
	}
	updateEnabledState() {
		this.parentEnabled = !this.parent ? true : this.parent.enabled;
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
	 * Called when the scene loads. Allows Controllers to do some asynchronous tasks and notify when they're done.
	 */
	async onLoad() {}

	/**
	 * Called when the scene starts (after everything was loaded).
	 */
	onStart() {}

	/**
	 * Called when the Controller is destroyed.
	 */
	onDestroy() {}

	/**
	 * Called whenever the Controller is enabled
	 */
	onEnable() { }

	/**
	 * Called whenever the Controller is disabled
	 */
	onDisable() {	}
}
