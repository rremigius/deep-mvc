import {Container, inject, optional} from "inversify";
import Model, {Registry} from "mozel";
import View, {ViewConstructor} from "../View";
import {isArray} from "lodash";
import {isSubClass} from "validation-kit";
import Log from "@/log";
import Controller from "../Controller";

const log = Log.instance("view-factory");

export default class ViewFactory {
	// If not set in constructor params, will be set in constructor. And readonly, so will always have value.
	dependencies:Container;
	readonly localDependencies:Container;
	public readonly registry:Registry<View>;
	public readonly controllerRegistry:Registry<Controller>;

	static createDependencyContainer() {
		return new Container({autoBindInjectable: true});
	}

	constructor(
		@inject("ControllerRegistry") @optional() controllerRegistry?:Registry<Controller>,
		@inject(Registry) @optional() viewRegistry?:Registry<View>,
		@inject('dependencies') @optional() dependencies?:Container,
	) {
		this.controllerRegistry = controllerRegistry || new Registry<Controller>();
		this.registry = viewRegistry || new Registry<View>();

		this.localDependencies = ViewFactory.createDependencyContainer();

		// Given container gets priority, then localContainer, then default
		if(dependencies) {
			this.dependencies = dependencies;
			this.dependencies.parent = this.localDependencies;
		} else {
			this.dependencies = this.localDependencies;
		}

		// Set scoped globals
		this.localDependencies.bind(Registry).toConstantValue(this.registry);
		this.localDependencies.bind("ControllerRegistry").toConstantValue(this.controllerRegistry);
		this.localDependencies.bind(ViewFactory).toConstantValue(this);
	}

	extendDependencies() {
		const newDependencies = new Container({autoBindInjectable: true});
		newDependencies.parent = this.dependencies;
		this.dependencies = newDependencies;
		return this.dependencies;
	}

	register(ViewClass:(typeof View)|(typeof View)[], ModelClass?:typeof Model) {
		if(isArray(ViewClass)) {
			for(let Class of ViewClass) {
				this.register(Class);
			}
			return;
		}
		ModelClass = ModelClass || ViewClass.ModelClass;
		this.localDependencies.bind<View>(View).to(ViewClass).whenTargetNamed(ModelClass.type);
	}

	create<T extends View>(model:Model, ExpectedClass?:ViewConstructor<T>):T {
		function isT(view:any) : view is T {
			return !ExpectedClass || view instanceof ExpectedClass;
		}

		// Other way of saying `model instanceof ExpectedClass.ModelClass`, which TypeScript does not allow because ModelClass is not a constructor type
		if(ExpectedClass && !isSubClass(model.constructor, ExpectedClass.ModelClass)) {
			const message = `${ExpectedClass.type} expects ${ExpectedClass.ModelClass.type}`;
			log.error(message, model);
			throw new Error(message);
		}

		// View needs a model in the constructor so we inject it through the dependencies
		const container = this.extendDependencies();
		container.bind(Model).toConstantValue(model);
		container.bind(Container).toConstantValue(this.dependencies);

		const view = container.getNamed(View, model.static.type);
		if(!isT(view)) {
			// TS: isT can only return false if ExpectedClass is defined
			const message = "Created View was not an " + ExpectedClass!.type;
			log.error(message, view, model);
			throw new Error(message);
		}

		this.registry.register(view);
		return view;
	}

	resolve<T extends View>(model:Model, ExpectedViewClass:ViewConstructor<T>, createNonExisting:boolean) {
		let view = this.registry.byGid(model.gid);

		// Create the view if it doesn't exist (unless if it's a reference).
		if(!view && createNonExisting) {
			view = this.create(model, ExpectedViewClass);
		}
		if(!view) {
			throw new Error(`Could not resolve View by GID ${model.gid}.`);
		}
		if(!(view instanceof ExpectedViewClass)) {
			throw new Error(`Model GID resolved to '${view.constructor.name}' rather than '${ExpectedViewClass.name}'`);
		}
		return view;
	}
}
