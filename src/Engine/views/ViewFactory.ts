import {Container, inject, injectable, optional} from "inversify";
import IView from "@/IView";

@injectable()
export default class ViewFactory {

	// If not set in constructor params, will be set in constructor. And readonly, so will always have value.
	readonly diContainer:Container;

	constructor(
		@inject('ViewDependencies') @optional() diContainer?:Container,
	) {
		if(!diContainer) {
			this.diContainer = new Container({autoBindInjectable:true});
		} else {
			this.diContainer = diContainer;
		}
	}

	/**
	 * Creates an IObject
	 * @param {T} interfaceSymbol
	 */
	create<T extends IView>(interfaceSymbol:symbol):T {
		let container = this.diContainer;
		return container.get<T>(interfaceSymbol);
	}

	get<T>(binding:any):T {
		return this.diContainer.get<T>(binding);
	}
}
