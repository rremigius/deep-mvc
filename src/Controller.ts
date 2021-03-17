import {inject, injectable as invInjectable, LazyServiceIdentifer} from "inversify";
import ControllerFactory, {ControllerModelType} from "@/Controller/ControllerFactory";
import Log from "@/log";
import Loader from "deep-loader";
import EngineInterface, {EngineInterfaceType} from "@/Engine/EngineInterface";
import {injectable} from "@/Controller/inversify";
import EventListener from "@/EventListener";
import RenderFactory from "@/renderers/RenderFactory";
import ControllerList from "@/Controller/ControllerList";
import ControllerSync from "@/Controller/ControllerSync";
import Mozel, {alphanumeric, Collection, Registry} from "mozel";
import ControllerModel from "@/models/ControllerModel";
import {check, Constructor, instanceOf} from "validation-kit";
import EventBus from "@/EventBus";
import EventEmitter, {callback, Events} from "@/EventEmitter";
import ControllerListSync from "@/Controller/ControllerListSync";
import PropertySync from "@/Controller/PropertySync";
import Property from "mozel/dist/Property";

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

	children:Record<string, Controller|ControllerList<Controller>> = {};
	propertySyncs:PropertySync<any,any>[] = [];

	loading:Loader;

	log = log;
	events = new ControllerEvents();
	actions = new ControllerActions();

	private eventListeners:EventListener<EventEmitter<unknown>>[] = [];

	_started:boolean = false;
	_enabled:boolean = false;

	protected initialized:boolean;

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

	controller<P extends ControllerModel, T extends Controller>(
		modelPath:string|Property,
		ControllerClass:ControllerConstructor<T>,
		init?:callback<T|undefined>
	) {
		if(modelPath instanceof Property) {
			modelPath = modelPath.getPathFrom(this.model);
		}
		const sync = new ControllerSync(this.model, modelPath, ControllerClass.ModelClass, ControllerClass, this.factory);

		sync.events.changed.on(event => {
			this.replace(event.path, event.current, event.isReference);
			if(init) {
				init(event.current);
			}
		});
		this.propertySyncs.push(sync);

		return sync;
	}

	controllers<P extends ControllerModel, T extends Controller>(
		modelPath:string|Property,
		ControllerClass:ControllerConstructor<T>,
		init?:callback<ControllerList<T>>
	) {
		if(modelPath instanceof Property) {
			modelPath = modelPath.getPathFrom(this.model);
		}
		const sync = new ControllerListSync(this.model, modelPath, ControllerClass.ModelClass, ControllerClass, this.factory);

		sync.events.changed.on(event => {
			const oldList = this.children[event.path];
			if(oldList instanceof ControllerList) {
				oldList.each(controller => controller.destroy());
			}
			delete this.children[event.path];
			if(!event.current) return;

			if(!(event.current instanceof ControllerList)) {
				throw this.error(`Expected ControllerList at model path ${modelPath}.`, event.current);
			}
			if(init) {
				// For type convenience, we return an empty ControllerList instead of undefined.
				init(event.current || new ControllerList<T>());
			}
			if(!event.isReference) {
				this.children[event.path] = <ControllerList<Controller>><unknown>event.current;
			}
		});
		this.propertySyncs.push(sync);

		return sync;
	}

	replace(path:string, newOne?:Controller|ControllerList<any>, isReference = false) {
		const oldOne = this.children[path];
		if(oldOne) oldOne.destroy();
		delete this.children[path];

		if(!newOne) return;

		if(!isReference) {
			this.children[path] = newOne;
		}
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

	resolveReference<T extends Controller>(ExpectedClass:ControllerConstructor<T>, model?:ControllerModel, createNonExisting=false):T|undefined {
		if(!model) return undefined;
		return this.factory.resolve<T>(model, ExpectedClass, createNonExisting);
	}

	isFrameListener() {
		return this.onFrame !== Controller.prototype.onFrame;
	}

	/**
	 * Runs the given callback on all children.
	 * @param callback
	 */
	forEachChild(callback:(child:Controller)=>void) {
		for(let path in this.children) {
			const child = this.children[path];
			if(child instanceof Controller) {
				callback(child);
			} else if (child instanceof ControllerList) {
				child.each(callback);
			}
		}
	}

	resolveReferences() {
		this.startModelSynchronization();
		this.onResolveReferences();
		this.forEachChild(child => child.resolveReferences());
	}

	startModelSynchronization() {
		for(let propertySync of this.propertySyncs) {
			propertySync.startWatching();
		}
	}

	synchronizeReferences() {
		this.propertySyncs.forEach(sync => {
			sync.resolveReferences = true;
			sync.sync();
		});
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
