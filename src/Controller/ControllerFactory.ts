import {Container, inject, injectable, optional} from "inversify";
import { isSubClass} from "validation-kit";
import Controller, {ControllerConstructor} from "@/Controller";
import ControllerModel from "@/models/ControllerModel";
import xrControllerContainer from "@/Controller/inversify";
import EngineInterface, {EngineInterfaceType} from "@/Engine/EngineInterface";
import {Registry} from "mozel";
import Log from "@/log";
import EventBus from "@/EventBus";
import {Events} from "@/EventEmitter";
import BaseEngine from "@/BaseEngine";

const log = Log.instance("controller-factory");

export const ControllerModelType = Symbol.for('ControllerModel');

@injectable()
export default class ControllerFactory {

	// If not set in constructor params, will be set in constructor. And readonly, so will always have value.
	readonly diContainer!:Container;

	readonly engine:EngineInterface;
	public eventBus:Events;
	public readonly registry:Registry<Controller>;

	constructor(
		@inject('container') @optional() diContainer?:Container,
		@inject(EventBus) @optional() eventBus?:Events,
		@inject(Registry) @optional() controllerRegistry?:Registry<Controller>,
		@inject(EngineInterfaceType) @optional() engine?:EngineInterface,
	) {
		this.registry = controllerRegistry || new Registry<Controller>();
		this.engine = engine || new BaseEngine();
		this.eventBus = eventBus || new Events(true);

		const localContainer = new Container({autoBindInjectable:true});

		// Set default bindings as parent
		localContainer.parent = xrControllerContainer;

		// Set scoped globals
		localContainer.bind(ControllerFactory).toConstantValue(this);
		localContainer.bind(Registry).toConstantValue(this.registry);
		localContainer.bind(EventBus).toConstantValue(this.eventBus);
		if(this.engine) {
			localContainer.bind(EngineInterfaceType).toConstantValue(this.engine);
		}

		// Given container gets priority, then localContainer, then default
		if(diContainer) {
			this.diContainer = diContainer;
			this.diContainer.parent = localContainer;
		} else {
			this.diContainer = localContainer;
		}
	}

	/**
	 * Create extension of the given DI Container, so we can override local dependencies.
	 * @param {ControllerModel} model
	 */
	extendDIContainer(model:ControllerModel) {
		const extension = new Container({autoBindInjectable:true});
		extension.parent = this.diContainer;

		// ControllerModel needs a Model in the constructor so we inject it through the container.
		extension.bind(ControllerModelType).toConstantValue(model);

		return extension;
	}

	/**
	 * Creates an Controller.
	 * If <T> matches ExpectedClass, is guaranteed to provide the correct class (or throw).
	 *
	 * Note: Factory has no knowledge of subclasses of Controller (among other reasons to prevent circular dependencies).
	 * @param {typeof Controller} ExpectedClass
	 * @param {model} model
	 * @param {boolean}	root		Set to true if the call is outside hierarchical intialisation (i.e. init method).
	 *								Will call the hierarchyUpdated lifecycle event.
	 */
	create<T extends Controller>(model:ControllerModel, ExpectedClass?:ControllerConstructor<T>):T {
		function isT(model:any) : model is T {
			return !ExpectedClass || model instanceof ExpectedClass;
		}
		// Other way of saying `model instanceof ExpectedClass.ModelClass`, which TypeScript does not allow because ModelClass is not a constructor type
		if(ExpectedClass && !isSubClass(model.constructor, ExpectedClass.ModelClass)) {
			const message = `${ExpectedClass.name} expects ${ExpectedClass.ModelClass.name}`;
			log.error(message, model);
			throw new Error(message);
		}
		let container = this.extendDIContainer(model);

		const controller = container.getNamed<Controller>(Controller, model.static.type);

		// Store in Registry
		this.registry.register(controller);
		if(!isT(controller)) {
			// TS: isT can only return false if ExpectedClass is defined
			const message = "Created Controller was not an " + ExpectedClass!.name;
			log.error(message, controller, model);
			throw new Error(message);
		}
		return controller;
	}

	createAndResolveReferences<T extends Controller>(model:ControllerModel, ExpectedClass?:ControllerConstructor<T>):T {
		const controller = this.create<T>(model, ExpectedClass);
		controller.resolveReferences();
		return controller;
	}

	resolve<T extends Controller>(model:ControllerModel, ExpectedControllerClass:ControllerConstructor<T>, createNonExisting:boolean) {
		let controller = this.registry.byGid(model.gid);

		// Create the controller if it doesn't exist (unless if it's a reference).
		if(!controller && createNonExisting) {
			controller = this.create(model, ExpectedControllerClass);
		}
		if(!controller) {
			throw new Error(`Could not resolve Controller by GID ${model.gid}.`);
		}
		if(!(controller instanceof ExpectedControllerClass)) {
			throw new Error(`Model GID resolved to '${controller.constructor.name}' rather than '${ExpectedControllerClass.name}'`);
		}
		return controller;
	}
}
