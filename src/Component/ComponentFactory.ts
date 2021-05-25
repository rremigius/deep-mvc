import {Container, injectable} from "inversify";
import {isSubClass} from "validation-kit";
import Component, {ComponentConstructor} from "@/Component";
import ComponentModel from "@/ComponentModel";
import {Registry} from "mozel";
import Log from "@/log";
import EventBus from "@/EventBus";
import {Events} from "@/EventEmitter";
import {isArray} from "lodash";

const log = Log.instance("component-factory");

@injectable()
export default class ComponentFactory {

	// If not set in constructor params, will be set in constructor. And readonly, so will always have value.
	dependencies:Container;
	readonly localDependencies:Container;
	public eventBus:Events;
	public readonly registry:Registry<Component>;

	static createDependencyContainer() {
		return new Container({autoBindInjectable: true});
	}

	constructor(
		eventBus?:Events,
		componentRegistry?:Registry<Component>,
		dependencies?:Container
	) {
		this.registry = componentRegistry || new Registry<Component>();
		this.eventBus = eventBus || new Events(true);

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
	initDependencies() { }

	extendDependencies() {
		const newDependencies = new Container({autoBindInjectable: true});
		newDependencies.parent = this.dependencies;
		this.dependencies = newDependencies;
		return this.dependencies;
	}

	/**
	 * Register a Component dependency.
	 * @param ComponentClass	The Component class to instantiate.
	 * @param ModelClass		The Model class for which to instantiate the Component. If omitted, will use the
	 * 							ModelClass defined in the Component.
	 */
	register(ComponentClass:(typeof Component)|(typeof Component)[], ModelClass?:typeof ComponentModel) {
		if(isArray(ComponentClass)) {
			for(let Class of ComponentClass) {
				this.register(Class);
			}
			return;
		}
		ModelClass = ModelClass || ComponentClass.ModelClass;
		if(!ModelClass) throw new Error(`No ModelClass specified for ${ComponentClass.name}.`);

		this.localDependencies.bind<Component>(Component).to(ComponentClass).whenTargetNamed(ModelClass.type);
	}

	/**
	 * Creates an Component.
	 * If <T> matches ExpectedClass, is guaranteed to provide the correct class (or throw).
	 *
	 * Note: Factory has no knowledge of subclasses of Component (among other reasons to prevent circular dependencies).
	 * @param {typeof Component} ExpectedClass
	 * @param {model} model
	 * @param {boolean}	root		Set to true if the call is outside hierarchical intialisation (i.e. init method).
	 *								Will call the hierarchyUpdated lifecycle event.
	 */
	create<T extends Component>(model:ComponentModel, ExpectedClass?:ComponentConstructor<T>):T {
		function isT(model:any) : model is T {
			return !ExpectedClass || model instanceof ExpectedClass;
		}
		// Other way of saying `model instanceof ExpectedClass.ModelClass`, which TypeScript does not allow because ModelClass is not a constructor type
		if(ExpectedClass && !isSubClass(model.constructor, ExpectedClass.ModelClass)) {
			const message = `${ExpectedClass.name} expects ${ExpectedClass.ModelClass.name}`;
			log.error(message, model);
			throw new Error(message);
		}

		// Component needs a ComponentModel in the constructor so we inject it through the container.
		let container = this.extendDependencies();
		container.bind(ComponentModel).toConstantValue(model);
		container.bind(Container).toConstantValue(this.dependencies);

		const component = container.getNamed<Component>(Component, model.static.type);

		// Store in Registry
		if(!isT(component)) {
			// TS: isT can only return false if ExpectedClass is defined
			const message = "Created Component was not an " + ExpectedClass!.name;
			log.error(message, component, model);
			throw new Error(message);
		}
		this.registry.register(component);
		return component;
	}

	createAndResolveReferences<T extends Component>(model:ComponentModel, ExpectedClass?:ComponentConstructor<T>):T {
		const component = this.create<T>(model, ExpectedClass);
		component.resolveReferences();
		return component;
	}

	resolve<T extends Component>(model:ComponentModel, ExpectedComponentClass:ComponentConstructor<T>, createNonExisting:boolean) {
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
