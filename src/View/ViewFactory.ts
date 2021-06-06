import ComponentFactory from "@/Component/ComponentFactory";
import {Container} from "inversify";
import {Events} from "@/EventEmitter";
import {Registry} from "mozel";
import Controller from "@/Controller";
import View from "@/View";

export default class ViewFactory extends ComponentFactory {
	controllerRegistry:Registry<Controller>;

	constructor(
		controllerRegistry?:Registry<Controller>,
		eventBus?:Events,
		registry?:Registry<View>,
		dependencies?:Container
	) {
		super(eventBus, registry, dependencies);
		this.controllerRegistry = controllerRegistry || new Registry<Controller>();
	}
}
