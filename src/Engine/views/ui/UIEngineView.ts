import EngineView from "@/Engine/views/EngineView";
import {component} from "@/Component";
import ComponentSlot from "@/Component/ComponentSlot";
import {schema} from "mozel";
import EngineModel from "@/Engine/models/EngineModel";
import UISceneView from "./UISceneView";

export default class UIEngineView extends EngineView {
	@component(schema(EngineModel), UISceneView)
	scene!:ComponentSlot<UISceneView>;

	onInit() {
		super.onInit();

		this.scene.init(scene => {
			if(!this.container || !scene) return;
			this.container.append(scene.domElement);
		});
		this.scene.deinit(scene => {
			if(!this.container || !scene) return;
			this.container.removeChild(scene.domElement);
		});
	}

	setSize(width: number, height: number) {
		super.setSize(width, height);
	}
	onAttachTo(container: HTMLElement) {
		super.onAttachTo(container);
		const scene = this.scene.get();
		if(!scene) return;

		container.append(scene.domElement);
	}
	detach() {
		super.detach();
		if(!this.container) return;
		const scene = this.scene.get();
		if(!scene) return;

		this.container.removeChild(scene.domElement);
	}
}
