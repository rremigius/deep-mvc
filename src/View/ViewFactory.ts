import ComponentFactory from "@/Component/ComponentFactory";
import {Registry} from "mozel";
import {ControllerRegistrySymbol} from "../View";
import Controller from "../Controller";

export default class ViewFactory extends ComponentFactory {
	setControllerRegistry(registry:Registry<Controller>) {
		this.localDependencies.bind(ControllerRegistrySymbol).toConstantValue(registry);
	}
}
