import {Container, inject, injectable, METADATA_KEY, optional} from "inversify";
import IView from "@/IView";
import IRenderer, {IRendererSymbol} from "@/Engine/views/common/IRenderer";
import {Constructor, isClass} from "validation-kit";
import {isArray} from "lodash";

export type IViewConstructor = Constructor<IView> & {ViewInterface:symbol};

@injectable()
export default class ViewFactory {

	// If not set in constructor params, will be set in constructor. And readonly, so will always have value.
	readonly dependencies:Container;

	static createDependencyContainer() {
		return new Container({autoBindInjectable: true});
	}

	constructor(
		@inject('ViewDependencies') @optional() dependencies?:Container,
	) {
		this.dependencies = dependencies || ViewFactory.createDependencyContainer();
		this.initDependencies();
	}

	// For override
	initDependencies() { }

	/**
	 * Register a View dependency for the given View symbol.
	 * @param ViewClass
	 * @param ViewInterfaceSymbol	The View interface symbol for which to instantiate the View. If omitted, will
	 * 								use ViewInterface symbol registered in the View class.
	 */
	register(ViewClass:IViewConstructor|IViewConstructor[], ViewInterfaceSymbol?:symbol) {
		if(isArray(ViewClass)) {
			for(let Class of ViewClass) {
				this.register(Class);
			}
			return;
		}
		if(!Reflect.hasMetadata(METADATA_KEY.PARAM_TYPES, ViewClass)) {
			injectable()(ViewClass); // make ViewClass injectable by Inversify
		}
		ViewInterfaceSymbol = ViewInterfaceSymbol || ViewClass.ViewInterface;
		this.dependencies.bind(ViewInterfaceSymbol).to(ViewClass);
	}

	/**
	 * Register the Renderer class to create from this ViewFactory
	 * @param RendererClass
	 */
	registerRenderer(RendererClass:Constructor<IRenderer>) {
		if(!Reflect.hasMetadata(METADATA_KEY.PARAM_TYPES, RendererClass)) {
			injectable()(RendererClass); // make ViewClass injectable by Inversify
		}
		this.dependencies.bind(IRendererSymbol).to(RendererClass);
	}

	/**
	 * Creates an IObject
	 * @param {T} interfaceSymbol
	 */
	create<T extends IView>(interfaceSymbol:symbol):T {
		let container = this.dependencies;
		return container.get<T>(interfaceSymbol);
	}

	createRenderer() {
		return this.dependencies.get<IRenderer>(IRendererSymbol);
	}

	/**
	 * General-purpose dependency injection.
	 * @param binding
	 */
	get<T>(binding:any):T {
		return this.dependencies.get<T>(binding);
	}

	/**
	 * General-purpose dependency injection.
	 * @param binding
	 * @param target
	 */
	bind(binding:any, target:any) {
		if(isClass(target) && !Reflect.hasMetadata(METADATA_KEY.PARAM_TYPES, target)) {
			injectable()(target); // make ViewClass injectable by Inversify
		}
		this.dependencies.bind(binding).to(target);
	}
}
