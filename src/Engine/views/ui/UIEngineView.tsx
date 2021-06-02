import EngineView from "@/Engine/views/EngineView";
import {component} from "@/Component";
import ComponentSlot from "@/Component/ComponentSlot";
import {schema} from "mozel";
import EngineModel from "@/Engine/models/EngineModel";
import UISceneView from "./UISceneView";

export default class UIEngineView extends EngineView {
	static Model = EngineModel;
	model!:EngineModel;

	@component(schema(EngineModel).scene, UISceneView)
	scene!:ComponentSlot<UISceneView>;

	domElement!:HTMLElement;

	onInit() {
		this.domElement = document.createElement('div');
		this.domElement.className = 'ui-engine-view-container';

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
		const scene = this.scene.current;
		if(!scene) return;
		container.append(scene.domElement);
	}
	detach() {
		super.detach();
		const scene = this.scene.current;
		if(!scene) return;
		scene.domElement.remove();
	}
}
