import Engine from "@/Engine/Engine";
import ThreeViewFactory from "@/Engine/views/threejs/ThreeViewFactory";
import {Registry} from "mozel";
import Controller from "@/Controller";

export default class PlainEngine extends Engine {
	createDefaultViewFactory(controllerRegistry:Registry<Controller>) {
		return new ThreeViewFactory(controllerRegistry);
	}
}
