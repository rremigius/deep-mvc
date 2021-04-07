import {Container, inject, injectable, optional} from "inversify";
import {isSubClass} from "validation-kit";
import Controller, {ControllerConstructor} from "@/Controller";
import ControllerModel from "@/ControllerModel";
import {Registry} from "mozel";
import Log from "@/log";
import EventBus from "@/EventBus";
import {Events} from "@/EventEmitter";
import ViewFactory from "@/Engine/views/ViewFactory";
import {isArray} from "lodash";

const log = Log.instance("controller-factory");

export const ControllerModelSymbol = Symbol.for('ControllerModel');

@injectable()
export default class ControllerFactory {

	// If not set in constructor params, will be set in constructor. And readonly, so will always have value.
	readonly dependencies:Container;
	readonly localDependencies:Container;
	public eventBus:Events;
	public readonly registry:Registry<Controller>;

	static createDependencyContainer() {
		return new Container({autoBindInjectable: true});
	}

	constructor(
		@inject(ViewFactory) @optional() viewFactory?:ViewFactory,
		@inject(EventBus) @optional() eventBus?:Events,
		@inject(Registry) @optional() controllerRegistry?:Registry<Controller>,
		@inject('dependencies') @optional() dependencies?:Container,
	) {
		this.registry = controllerRegistry || new Registry<Controller>();
		this.eventBus = eventBus || new Events(true);
		viewFactory = viewFactory || new ViewFactory();

		this.localDependencies = ControllerFactory.createDependencyContainer();

		// Given container gets priority, then localContainer, then default
		if(dependencies) {
			this.dependencies = dependencies;
			this.dependencies.parent = this.localDependencies;
		} else {
			this.dependencies = this.localDependencies;
		}

		// Set scoped globals
		this.localDependencies.bind(ControllerFactory).toConstantValue(this);
		this.localDependencies.bind(Registry).toConstantValue(this.registry);
		this.localDependencies.bind(EventBus).toConstantValue(this.eventBus);
		this.localDependencies.bind(Container).toConstantValue(this.dependencies);
		this.localDependencies.bind<ViewFactory>(ViewFactory).toConstantValue(viewFactory);

		this.initDependencies();
	}

	// For override
	initDependencies() { }

	/**
	 * Register a Controller dependency.
	 * @param ControllerClass	The Controller class to instantiate.
	 * @param ModelClass		The Model class for which to instantiate the Controller. If omitted, will use the
	 * 							ModelClass defined in the Controller.
	 */
	register(ControllerClass:(typeof Controller)|(typeof Controller)[], ModelClass?:typeof ControllerModel) {
		if(isArray(ControllerClass)) {
			for(let Class of ControllerClass) {
				this.register(Class);
			}
			return;
		}
		ModelClass = ModelClass || ControllerClass.ModelClass;
		if(!ModelClass) throw new Error(`No ModelClass specified for ${ControllerClass.name}.`);

		this.localDependencies.bind<Controller>(Controller).to(ControllerClass).whenTargetNamed(ModelClass.type);
	}

	/**
	 * Create extension of the given DI Container, so we can override local dependencies.
	 * @param {ControllerModel} model
	 */
	extendDIContainer(model:ControllerModel) {
		const extension = new Container({autoBindInjectable:true});
		extension.parent = this.dependencies;

		// ControllerModel needs a Model in the constructor so we inject it through the container.
		extension.bind(ControllerModelSymbol).toConstantValue(model);

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

		let controller;
		try {
			controller = container.getNamed<Controller>(Controller, model.static.type);
		} catch(e) {
			throw new Error(`Could not create a controller for '${model.static.type}' model.\n-> ${e.message}`);
		}

		// Store in Registry
		if(!isT(controller)) {
			// TS: isT can only return false if ExpectedClass is defined
			const message = "Created Controller was not an " + ExpectedClass!.name;
			log.error(message, controller, model);
			throw new Error(message);
		}
		this.registry.register(controller);
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
