import {inject, injectable as invInjectable, LazyServiceIdentifer} from "inversify";
import ControllerFactory, {ControllerModelType} from "@/Controller/ControllerFactory";
import Log from "@/log";
import Loader from "deep-loader";
import EngineInterface, {EngineInterfaceType} from "@/Engine/EngineInterface";
import {injectable} from "@/Controller/inversify";
import EventListener from "@/EventListener";
import RenderFactory from "@/renderers/RenderFactory";
import ControllerList from "@/Controller/ControllerList";
import ModelControllerSync from "@/Controller/ModelControllerSync";
import {alphanumeric, Collection, Registry} from "mozel";
import ControllerModel from "@/models/ControllerModel";
import {check, Constructor, instanceOf} from "validation-kit";
import EventBus from "@/EventBus";
import EventEmitter, {callback, Events} from "@/EventEmitter";

export {injectable};

const log = Log.instance("controller");

export type ControllerConstructor<T extends Controller> = {
	new (...args: any[]): T;
	ModelClass:(typeof ControllerModel);
};

export class ControllerAction<T> {
	data:T;
	constructor(data:T) {
		this.data = data;
	}
}

export class ControllerEvent<T extends object|void|unknown> {
	origin?:Controller;
	data:T;
	constructor(origin:Controller|undefined, data:T) {
		this.origin = origin;
		this.data = data;
	}
}

export class ControllerEnabledEvent extends ControllerEvent<void> { }
export class ControllerDisabledEvent extends ControllerEvent<void> { }

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

@invInjectable()
export default class Controller {
	static ModelClass:(typeof ControllerModel); // should be set for each extending class

	readonly gid:alphanumeric;

	public readonly model:ControllerModel;
	readonly factory:ControllerFactory;
	readonly engine:EngineInterface;
	readonly registry:Registry<Controller>;
	readonly eventBus:EventBus;
	readonly renderFactory:RenderFactory;

	children:ControllerList<Controller> = new ControllerList<Controller>();
	childrenLists:ControllerList<Controller>[] = [];

	loading:Loader;

	log = log;
	events = new ControllerEvents();
	actions = new ControllerActions();

	private eventListeners:EventListener<EventEmitter<unknown>>[] = [];
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
		@inject(EventBus) eventBus:EventBus,
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

	protected error(...args:unknown[]) {
		this.log.error(...args);
		return new Error(""+args[0]);
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
		controllerList.events.added.on(event => {
			const controller = event.controller;
			if(this.started && !controller.started) controller.start();
		});

		const children = collection.map((model:ControllerModel) => this.factory.create<T>(ExpectedControllerClass, model));
		children.forEach(controller => controllerList!.add(controller)); // add one by one to also trigger events

		return controllerList;
	}

	private syncControllerList<T extends Controller>(controllerList:ControllerList<T>, collection:Collection<ControllerModel>, ExpectedControllerClass:ControllerConstructor<T>) {
		// Synchronize controller -> model
		controllerList.events.added.on(event => {
			const controller = event.controller;
			if(collection.find(controller.model)) return; // model already exists in Collection
			collection.add(controller.model)
		});
		controllerList.events.removed.on(event => {
			collection.remove(event.controller.model)
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
			sync.events.changed.on(event => {
				if(event.oldController) {
					this.children.remove(event.oldController);
				}
				if(event.controller) {
					this.children.add(event.controller);
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
		this.eventListeners.forEach(listener => listener.stop());
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
			this.events.disabled.fire(new ControllerDisabledEvent(this));
		} else {
			this.onEnable();
			this.events.enabled.fire(new ControllerEnabledEvent(this));
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
