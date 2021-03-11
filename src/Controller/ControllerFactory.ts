import {Container, inject, injectable, optional} from "inversify";
import { isSubClass} from "validation-kit";
import Controller, {ControllerConstructor} from "@/Controller";
import ControllerModel from "@/models/ControllerModel";
import xrControllerContainer from "@/Controller/inversify";
import EngineInterface, {EngineInterfaceType} from "@/Engine/EngineInterface";
import {Registry} from "mozel";
import Log from "@/log";
import EventInterface, {EventInterfacer} from "event-interface-mixin";
import EventBus from "@/EventBus";

const log = Log.instance("controller-factory");

export const ControllerModelType = Symbol.for('ControllerModel');

@injectable()
export default class ControllerFactory {

	// If not set in constructor params, will be set in constructor. And readonly, so will always have value.
	readonly diContainer!:Container;

	readonly xrEngineInterface:EngineInterface;
	public eventBus:EventInterfacer = new EventInterface();
	public readonly registry:Registry<Controller>;

	constructor(
		@inject(EngineInterfaceType) @optional() xrEngineInterface:EngineInterface,
		@inject('container') @optional() diContainer?:Container,
		@inject(EventBus) @optional() eventBus?:EventInterfacer,
		@inject(Registry) @optional() controllerRegistry?:Registry<Controller>
	) {
		this.registry = controllerRegistry || new Registry<Controller>();
		this.xrEngineInterface = xrEngineInterface;
		this.eventBus = eventBus || new EventInterface();

		const localContainer = new Container({autoBindInjectable:true});

		// Set default bindings as parent
		localContainer.parent = xrControllerContainer;

		// Set scoped globals
		localContainer.bind(ControllerFactory).toConstantValue(this);
		localContainer.bind(Registry).toConstantValue(this.registry);
		localContainer.bind(EventBus).toConstantValue(this.eventBus);
		if(this.xrEngineInterface) {
			localContainer.bind(EngineInterfaceType).toConstantValue(this.xrEngineInterface);
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
	 * @param {boolean}	root					Set to true if the call is outside hierarchical intialisation (i.e. init method).
	 * 																Will call the hierarchyUpdated lifecycle event.
	 */
	create<T extends Controller>(ExpectedClass:ControllerConstructor<T>, model:ControllerModel, root:boolean = false):T {
		function isT(model:any) : model is T {
			return model instanceof ExpectedClass;
		}
		// Other way of saying `model instanceof ExpectedClass.ModelClass`, which TypeScript does not allow because ModelClass is not a constructor type
		if(!isSubClass(model.constructor, ExpectedClass.ModelClass)) {
			const message = `${ExpectedClass.name} expects ${ExpectedClass.ModelClass.name}`;
			log.error(message, model);
			throw new Error(message);
		}
		if(!model.static.hasOwnProperty('type')) {
			const message = `${model.static.name} has no specifically defined static 'type'.`;
			log.error(message, model);
			throw new Error(message);
		}

		let container = this.extendDIContainer(model);

		let controller;
		try {
			controller = container.getNamed<Controller>(Controller, model.static.type);
			// Store in Registry
			this.registry.register(controller);
			if(root) {
				controller.resolveReferences();
			}
		} catch(e) {
			const message = `Controller creation failed for ${model.static.name}: ${e.message}`;
			log.error(message, model);
			throw new Error(message);
		}
		if(!isT(controller)) {
			const message = "Created Controller was not an " + ExpectedClass.name;
			log.error(message, controller, model);
			throw new Error(message);
		}
		return controller;
	}
}
