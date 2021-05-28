import Engine from "@/Engine/Engine";
import ComponentFactory from "@/Component/ComponentFactory";
import ThreeViewFactory from "@/Engine/views/threejs/ThreeViewFactory";

export default class PlainEngine extends Engine {
	createComponentFactories(): Record<string, ComponentFactory> {
		const controllerFactory = Engine.createDefaultControllerFactory();
		return {
			controller: controllerFactory,
			view: new ThreeViewFactory(controllerFactory.registry)
		}
	}
}
