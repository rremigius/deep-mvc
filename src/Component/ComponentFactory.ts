import {Container, injectable} from "inversify";
import {isSubClass} from "validation-kit";
import Component, {ComponentConstructor} from "../Component";
import Mozel, {Registry} from "mozel";
import Log from "../log";
import EventBus from "../EventBus";
import {isArray} from "lodash";
import EventInterface from "event-interface-mixin";

const log = Log.instance("component-factory");

const ComponentSymbol = Symbol.for("Component");

@injectable()
export default class ComponentFactory {

	/**
	 * Infersify dependency container from which all registered dependencies can be retrieved. If provided in the constructor, this
	 * will be the provided container. New dependencies should not be added to this container, at the risk of polluting
	 * the external dependency container.
	 */
	dependencies:Container;

	/** Local Infersify dependency Container to which any internal classes and services can be registered. */
	readonly localDependencies:Container;
	/** EventBus that is provided to all created Components to communicate between each other. */
	public readonly eventBus:EventBus;
	/** Registry to which all created Components are registed. */
	public readonly registry:Registry<Component>;

	/**
	 * Creates a dependency container that can be used for the ComponentFactory.
	 */
	static createDependencyContainer() {
		return new Container({autoBindInjectable: true});
	}

	constructor(
		eventBus?:EventInterface,
		componentRegistry?:Registry<Component>,
		dependencies?:Container
	) {
		this.registry = componentRegistry || new Registry<Component>();
		this.eventBus = eventBus || new EventBus();

		this.localDependencies = ComponentFactory.createDependencyContainer();

		// Given container gets priority, then localContainer, then default
		if(dependencies) {
			this.dependencies = dependencies;
			this.dependencies.parent = this.localDependencies;
		} else {
			this.dependencies = this.localDependencies;
		}

		// Set scoped globals
		this.localDependencies.bind(ComponentFactory).toConstantValue(this);
		this.localDependencies.bind(Registry).toConstantValue(this.registry);
		this.localDependencies.bind(EventBus).toConstantValue(this.eventBus);

		this.initDependencies();
	}

	// For override
	protected initDependencies() { }

	/**
	 * Creates a new dependency container, extending from the existing one.
	 * Dependencies can be added to the new container without polluting the existing one.
	 */
	extendDependencies() {
		const newDependencies = new Container({autoBindInjectable: true});
		newDependencies.parent = this.dependencies;
		return newDependencies;
	}

	/**
	 * Register a Component dependency.
	 * @param ComponentClass	The Component class to instantiate.
	 * @param ModelClass		The Model class for which to instantiate the Component. If omitted, will use the
	 * 							ModelClass defined in the Component.
	 */
	register(ComponentClass:(typeof Component)|(typeof Component)[], ModelClass?:typeof Mozel) {
		if(isArray(ComponentClass)) {
			for(let Class of ComponentClass) {
				this.register(Class);
			}
			return;
		}
		ModelClass = ModelClass || ComponentClass.Model;
		if(!ModelClass) throw new Error(`No Model specified for ${ComponentClass.name}.`);

		this.localDependencies.bind<Component>(ComponentSymbol).to(ComponentClass).whenTargetNamed(ModelClass.type);
	}

	/**
	 * Registers a default Component class when a parent class is required.
	 * @param {typeof Component} Base
	 * @param {typeof Component} Implementation
	 */
	registerDefault(Base:typeof Component, Implementation:typeof Component) {
		this.localDependencies.bind(Base).to(Implementation);
	}

	/**
	 * Finds the first bound component class up the hierarchy for the given Mozel class.
	 * @param {typeof Mozel} Model
	 */
	findFirstBoundModelInHierarchy(Model:typeof Mozel):typeof Mozel|undefined {
		if(this.dependencies.isBoundNamed(ComponentSymbol, Model.type)) {
			return Model;
		}
		if(Model === Mozel) return;
		return this.findFirstBoundModelInHierarchy(Model.getParentClass());
	}

	/**
	 * Creates a Component based on a Model.
	 * If <T> matches ExpectedClass, is guaranteed to provide the correct class (or throw).
	 *
	 * @param {Mozel} model
	 * @param {typeof Component} ExpectedClass
	 */
	create<T extends Component>(model:Mozel, ExpectedClass?:ComponentConstructor<T>):T {
		function isT(model:any) : model is T {
			return !ExpectedClass || model instanceof ExpectedClass;
		}
		// Other way of saying `model instanceof ExpectedClass.Model`, which TypeScript does not allow because Model is not a constructor type
		if(ExpectedClass && !isSubClass(model.constructor, ExpectedClass.Model)) {
			const message = `${ExpectedClass.name} expects ${ExpectedClass.Model.name}`;
			log.error(message, model);
			throw new Error(message);
		}

		// Component needs a Mozel in the constructor so we inject it through the container.
		let container = this.extendDependencies();
		container.bind(Mozel).toConstantValue(model);
		container.bind(Container).toConstantValue(this.dependencies);

		let component;
		const BoundMozel = this.findFirstBoundModelInHierarchy(model.static);
		if(BoundMozel) {
			component = container.getNamed<Component>(ComponentSymbol, BoundMozel.type);
			log.info(`Component '${component.static.name}' generated for model '${model.static.type}'.`);
		} else if(ExpectedClass) {
			// Try an generic placeholder for the expected class
			component = container.get(ExpectedClass);
			log.info(`No Component registered for '${model.static.type}'; created generic ${ExpectedClass.name} (${component.static.name}).`);
		} else {
			throw new Error(`No Component registered for '${model.static.type}'; could not create generic Component.`);
		}

		// Store in Registry
		if(!isT(component)) {
			// TS: isT can only return false if ExpectedClass is defined
			const message = "Created Component was not a " + ExpectedClass!.name;
			log.error(message, component, model);
			throw new Error(message);
		}
		this.registry.register(component);
		return component;
	}

	/**
	 * Creates a Component based on a model, and resolves all references in the hierarchy right afterwards.
	 * @param {Mozel} model
	 * @param {typeof Component} ExpectedClass
	 */
	createAndResolveReferences<T extends Component>(model:Mozel, ExpectedClass?:ComponentConstructor<T>):T {
		const component = this.create<T>(model, ExpectedClass);
		component.resolveReferences();
		return component;
	}

	/**
	 * Attempts to find the component corresponding to the given model.
	 * @param {Mozel} model
	 * @param {typeof Component} ExpectedComponentClass		The expected Component class. Will throw if the found
	 * 														(or created) Component is not of the correct class.
	 * @param {boolean} createNonExisting					If set to `true`, will create a new instance if no existing
	 * 														Component was found.
	 */
	resolve<T extends Component>(model:Mozel, ExpectedComponentClass:ComponentConstructor<T>, createNonExisting:boolean) {
		let component = this.registry.byGid(model.gid);

		// Create the component if it doesn't exist (unless suppressed).
		if(!component && createNonExisting) {
			component = this.create(model, ExpectedComponentClass);
		}
		if(!component) {
			throw new Error(`Could not resolve Component by GID ${model.gid}.`);
		}
		if(!(component instanceof ExpectedComponentClass)) {
			throw new Error(`Model GID ${model.gid} resolved to '${component.constructor.name}' rather than '${ExpectedComponentClass.name}'.`);
		}
		return component;
	}
}
