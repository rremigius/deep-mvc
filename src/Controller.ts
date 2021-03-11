import {inject, injectable, LazyServiceIdentifer} from "inversify";
import ControllerFactory, {ControllerModelType} from "@/Controller/ControllerFactory";
import Log from "@/log";
import Loader from "deep-loader";
import EventInterface, {Callback, Event, EventClass, EventInterfacer} from "event-interface-mixin";
import EngineInterface, {EngineInterfaceType} from "@/Engine/EngineInterface";
import {injectableController} from "@/Controller/inversify";
import EventListener from "@/EventListener";
import RenderFactory from "@/renderers/RenderFactory";
import ControllerList from "@/Controller/ControllerList";
import ModelControllerSync, {ControllerChangeEvent} from "@/Controller/ModelControllerSync";
import {alphanumeric, Collection, Registry} from "mozel";
import ControllerModel from "@/models/ControllerModel";
import {check, instanceOf} from "validation-kit";
import {isString} from "lodash";
import EventBus from "@/EventBus";

export {injectableController};

const log = Log.instance("Controller");

export type ControllerConstructor<T extends Controller> = {
	new (...args: any[]): T;
	ModelClass:(typeof ControllerModel);
};

export class Action<T> extends Event<T> {}
export type ActionClass<E extends Event<T>,T> = EventClass<E,T>;

export {Event, EventClass} from "event-interface-mixin";

@injectable()
export default class Controller {
	static ModelClass:(typeof ControllerModel); // should be set for each extending class

	readonly gid:alphanumeric;

	public readonly model:ControllerModel;
	readonly factory:ControllerFactory;
	readonly engine:EngineInterface;
	readonly registry:Registry<Controller>;
	readonly eventBus:EventInterfacer;
	readonly renderFactory:RenderFactory;

	children:ControllerList<Controller> = new ControllerList<Controller>();
	childrenLists:ControllerList<Controller>[] = [];

	loading:Loader;

	eventInterface = new EventInterface();
	on = this.eventInterface.getOnMethod();
	off = this.eventInterface.getOffMethod();
	fire = this.eventInterface.getFireMethod();

	private eventListeners:EventListener<Event<unknown>, unknown>[] = [];
	private actions = new EventInterface();
	private actionClasses:Record<string,ActionClass<any,any>> = {};
	private eventClasses:Record<string,EventClass<any,any>> = {};
	private readonly controllerSyncs:ModelControllerSync<Controller>[];

	_started:boolean = false;
	_enabled:boolean = false;

	protected initialized:boolean;
	private _initialReferencesResolved:boolean = false;
	get initialReferencesResolved() { return this._initialReferencesResolved };

	constructor(
		// using LazyServiceIdentifier to prevent circular dependency problem
		@inject(new LazyServiceIdentifer(()=>ControllerModelType)) model:ControllerModel,
		// using LazyServiceIdentifier to prevent circular dependency problem
		@inject(new LazyServiceIdentifer(()=>ControllerFactory)) controllerFactory:ControllerFactory,
		@inject(EngineInterfaceType) xrEngine:EngineInterface,
		@inject(Registry) registry:Registry<Controller>,
		@inject(EventBus) eventBus:EventInterfacer,
		@inject(RenderFactory) renderFactory:RenderFactory
	) {
		if(!this.static.ModelClass || !(model instanceof this.static.ModelClass)) {
			throw new Error(`Invalid Model provided to Controller '${this.static.name}'.`);
		}
		this.model = model;
		this.gid = model.gid;
		this.factory = controllerFactory;
		this.engine = xrEngine;
		this.registry = registry;
		this.eventBus = eventBus;
		this.renderFactory = renderFactory;

		this.initialized = false;
		this.controllerSyncs = [];

		const name = this.static.name;
		this.loading = new Loader(name);

		// We don't want to traverse the hierarchy on every frame, so only registered elements are called.
		if(this.isFrameListener()) {
			this.engine.addFrameListener(this);
		}

		this.init(model);
		this.initialized = true;
	}

	get static() {
		return <typeof Controller>this.constructor;
	}

	get enabled() {
		return this._enabled;
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

	/**
	 * Starts listening to an event of the target EventInterfacer, storing the callback locally to be destroyed and
	 * unsubscribed when the Controller is destroyed.
	 * @param eventInterfacer
	 * @param event
	 * @param callback
	 */
	listenTo<E extends Event<T>, T>(eventInterfacer:EventInterfacer, event:EventClass<E,T>|string, callback:Callback<E>) {
		if(isString(event)) {
			event = this.eventClasses[event] || event;
			if(isString(event)) {
				log.error(`Cannot listen to unknown event '${event}.`);
				return;
			}
		}
		const eventListener = new EventListener(callback, eventInterfacer, event);
		eventListener.start();
		// TS: we can't use the event listener callbacks in this class anyway
		this.eventListeners.push(eventListener as EventListener<any, any>);
		return eventListener;
	}

	resolveReference<T extends Controller>(ExpectedClass:typeof Controller, model?:ControllerModel, allowControllerCreation=false):T|undefined {
		if(!model) return undefined;

		function isT(model:any) : model is T {
			return model instanceof ExpectedClass;
		}

		let controller = this.registry.byGid(model.gid);
		if(!controller && allowControllerCreation) {
			controller = this.factory.create(ExpectedClass, model, true);
		}
		if(!isT(controller)) {
			log.error(`Controller with GID ${model.gid} was not an instance of ${ExpectedClass.name}.`);
			return;
		}
		return controller;
	}

	isFrameListener() {
		return this.onFrame !== Controller.prototype.onFrame;
	}

	createControllerList<T extends Controller>(collection:Collection<ControllerModel>, ExpectedControllerClass:ControllerConstructor<T>):ControllerList<T> {
		return this.setupControllerList(new ControllerList<T>(), collection, ExpectedControllerClass);
	}
	setupControllerList<T extends Controller>(controllerList:ControllerList<T>, collection:Collection<ControllerModel>, ExpectedControllerClass:ControllerConstructor<T>) {
		// TODO: Without casting we get "Type Controller is not assignable to type T" I don't understand why this would be a problem
		this.childrenLists.push(<ControllerList<Controller>><unknown>controllerList);

		this.syncControllerList(controllerList, collection, ExpectedControllerClass);
		controllerList.events.added.on(controller => {
			if(this.started && !controller.started) controller.start();
		});

		const children = collection.map((model:ControllerModel) => this.factory.create<T>(ExpectedControllerClass, model));
		children.forEach(controller => controllerList!.add(controller)); // add one by one to also trigger events

		return controllerList;
	}

	private syncControllerList<T extends Controller>(controllerList:ControllerList<T>, collection:Collection<ControllerModel>, ExpectedControllerClass:ControllerConstructor<T>) {
		// Synchronize controller -> model
		controllerList.events.added.on(controller => {
			if(collection.find(controller.model)) return; // model already exists in Collection
			collection.add(controller.model)
		});
		controllerList.events.removed.on(controller => {
			collection.remove(controller.model)
		});

		// Synchronize model -> controller
		collection.onAdded(model => {
			const $model = check<ControllerModel>(model, instanceOf(ControllerModel), 'model');
			const controller = this.resolveReference<T>(ExpectedControllerClass, $model, true);
			if(!controller) {
				log.error(`Could not resolve or create controller based on Model with GID '${$model.gid}'.`);
				return;
			}

			// Already existed, but not in list, add
			if(!controllerList.has(controller)) {
				controllerList.add(controller);
			}
		});
		collection.onRemoved(removedModel => controllerList.remove(
			controller => controller.model === removedModel)
		);
	}

	createControllerSync<T extends Controller>(modelPath:string, ControllerClass:typeof Controller, childController:boolean = false) {
		const sync = new ModelControllerSync<T>(this, this.model, modelPath, ControllerClass, this.factory, childController);
		if(childController) {
			sync.startWatching();
		}

		this.controllerSyncs.push(sync);

		if(childController) {
			sync.on(ControllerChangeEvent, event => {
				if(event.data.old) {
					this.children.remove(event.data.old);
				}
				if(event.data.controller) {
					this.children.add(event.data.controller);
				}
			});
		}

		return sync;
	}

	/**
	 * Runs the given callback on all children.
	 * @param callback
	 */
	forEachChild(callback:(child:Controller)=>void) {
		this.children.each(callback);
		this.childrenLists.forEach(list => {
			list.each(callback);
		});
	}

	resolveReferences() {
		if(!this.initialReferencesResolved) {
			this.startReferenceSynchronization();
			this._initialReferencesResolved = true;
		}
		this.onResolveReferences();
		this.forEachChild(child => child.resolveReferences());
	}

	startReferenceSynchronization() {
		if(this.initialReferencesResolved) {
			log.error(`${this} already initialized. Reference synchronization should already be running.`);
			return;
		}
		for(let controllerSync of this.controllerSyncs) {
			if(!controllerSync.isForChildController()) {
				// Child controller syncs already started watching in/after constructor
				controllerSync.startWatching();
			}
		}
	}

	onResolveReferences() {

	}

	async load() {
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
	start(enabled:boolean = true) {
		log.info(`${this.name} starting...`);
		this._started = true;
		this.onStart();

		this.forEachChild((child:Controller) => {
			child.start();
		});

		this.enable(enabled);
	}
	destroy() {
		if(this.isFrameListener()) {
			this.engine.removeFrameListener(this);
		}
		this.stopListening();

		this.onDestroy();
		this.forEachChild((child:Controller) => {
			child.destroy();
		});
	}
	stopListening() {
		this.eventListeners.forEach((listener:EventListener<Event<unknown>,unknown>) => listener.stop());
	}
	enable(enabled:boolean = true) {
		// TODO: remember state if disabled from parent
		if(enabled === this._enabled) return;

		if(enabled) {
			log.info(`${this} enabled.`);
		} else {
			log.info(`${this} disabled.`);
		}
		this._enabled = enabled;
		if(!enabled) {
			this.onDisable();
		} else {
			this.onEnable();
		}
		this.forEachChild((child:Controller) => {
			child.enable(enabled);
		});
	}
	frame() {
		if(!this._enabled) {
			return;
		}
		this.onFrame();
	}

	/**
	 * Registers an Event so it can be subscribed by name.
	 * @param Event
	 */
	registerEvent<E extends Event<T>, T>(Event:EventClass<E,T>) {
		if(Event.name in this.eventClasses && Action !== this.actionClasses[Action.name]) {
			log.error(`Conflicting Event classes for action '${Action.name}'.`);
		} else {
			this.eventClasses[Event.name] = Action;
		}
	}

	/**
	 * Registers an action so it can be activated. Also registers the Action name so it can be called by name.
	 * @param Action
	 * @param callback
	 */
	registerAction<E extends Action<T>, T>(Action:ActionClass<E,T>, callback:Callback<E>) {
		this.actions.on(Action, callback);
		if(Action.name in this.actionClasses && Action !== this.actionClasses[Action.name]) {
			log.error(`Conflicting Action classes for action '${Action.name}'.`);
		} else {
			this.actionClasses[Action.name] = Action;
		}
	}

	callAction<E extends Event<T>, T>(Action:EventClass<E,T>|string, event:T) {
		if(isString(Action)) {
			if(!(Action in this.actionClasses)) {
				log.error(`No action called '${Action}'`);
				return;
			}
			const FoundAction = this.actionClasses[Action];
			if(event instanceof FoundAction) {
				// TS: because payload type is defined as instance of Action
				Action = <EventClass<E,T>>FoundAction;
			}
			log.error(`Payload did not match action '${Action}'`, event);
			return;
		}
		if(!(event instanceof Action)) { // runtime check
			log.error(`Payload did not match action '${Action.name}'`, event);
			return;
		}
		this.actions.fire(event);
	}

	toString() {
		return `${this.name} (${this.gid})`;
	}

	/*
	Life cycle hooks
	 */

	/**
	 * Called any time the hierarchy changes. Allows Controllers to resolve their references.
	 */
	onHierarchy() {}

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
	 * Called on every frame. Performance-sensitive!
	 */
	onFrame() {}

	/**
	 * Called whenever the Controller is enabled
	 */
	onEnable() { }

	/**
	 * Called whenever the Controller is disabled
	 */
	onDisable() {	}
}
