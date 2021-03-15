import {Container, inject, injectable, optional} from "inversify";
import Log from "@/log";
import ObjectRenderInterface from "@/renderers/common/ObjectRenderInterface";

const log = Log.instance("RenderFactory");

@injectable()
export default class RenderFactory {

	// If not set in constructor params, will be set in constructor. And readonly, so will always have value.
	readonly diContainer:Container;

	constructor(
		@inject('RenderContainer') @optional() diContainer?:Container,
	) {
		if(!diContainer) {
			this.diContainer = new Container({autoBindInjectable:true});
		} else {
			this.diContainer = diContainer;
		}
	}

	/**
	 * Creates an ObjectInterface
	 * @param {T} interfaceName
	 */
	create<T extends ObjectRenderInterface>(interfaceName:string):T {
		let container = this.diContainer;
		return container.get<T>(interfaceName);
	}

	get<T>(binding:any):T {
		return this.diContainer.get<T>(binding);
	}
}
