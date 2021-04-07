import Engine from "@/Engine/Engine";
import ThreeViewFactory from "@/Engine/views/threejs/ThreeViewFactory";

export default class PlainEngine extends Engine {
	createDefaultViewFactory() {
		return new ThreeViewFactory();
	}
}
