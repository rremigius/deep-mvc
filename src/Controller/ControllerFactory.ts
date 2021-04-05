import {Container, inject, injectable, optional} from "inversify";
import {isSubClass} from "validation-kit";
import Controller, {ControllerConstructor} from "@/Controller";
import ControllerModel from "@/ControllerModel";
import controllerContainer from "@/Controller/dependencies";
import {Registry} from "mozel";
import Log from "@/log";
import EventBus from "@/EventBus";
import {Events} from "@/EventEmitter";
import ViewFactory from "@/Engine/views/ViewFactory";

const log = Log.instance("controller-factory");

export const ControllerModelType = Symbol.for('ControllerModel');

@injectable()
export default class ControllerFactory {

	// If not set in constructor params, will be set in constructor. And readonly, so will always have value.
	readonly dependencies!:Container;
	public eventBus:Events;
	public readonly registry:Registry<Controller>;

	constructor(
		@inject('dependencies') @optional() dependencies?:Container,
		@inject(ViewFactory) @optional() viewFactory?:ViewFactory,
		@inject(EventBus) @optional() eventBus?:Events,
		@inject(Registry) @optional() controllerRegistry?:Registry<Controller>
	) {
		this.registry = controllerRegistry || new Registry<Controller>();
		this.eventBus = eventBus || new Events(true);
		viewFactory = viewFactory || new ViewFactory();

		const localContainer = new Container({autoBindInjectable:true});

		// Set default bindings as parent
		localContainer.parent = controllerContainer;

		// Given container gets priority, then localContainer, then default
		if(dependencies) {
			this.dependencies = dependencies;
			this.dependencies.parent = localContainer;
		} else {
			this.dependencies = localContainer;
		}

		// Set scoped globals
		localContainer.bind(ControllerFactory).toConstantValue(this);
		localContainer.bind(Registry).toConstantValue(this.registry);
		localContainer.bind(EventBus).toConstantValue(this.eventBus);
		localContainer.bind(Container).toConstantValue(this.dependencies);
		localContainer.bind<ViewFactory>(ViewFactory).toConstantValue(viewFactory);
	}

	/**
	 * Create extension of the given DI Container, so we can override local dependencies.
	 * @param {ControllerModel} model
	 */
	extendDIContainer(model:ControllerModel) {
		const extension = new Container({autoBindInjectable:true});
		extension.parent = this.dependencies;

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
