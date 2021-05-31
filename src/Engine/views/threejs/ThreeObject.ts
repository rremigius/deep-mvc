import ThreeView from "@/Engine/views/threejs/ThreeView";
import ObjectModel from "@/Engine/models/ObjectModel";
import Component, {components} from "@/Component";
import {deep, schema} from "mozel";
import ComponentList from "@/Component/ComponentList";
import ObjectController from "@/Engine/controllers/ObjectController";
import Vector3 from "@/Engine/views/common/Vector3";

export default class ThreeObject extends ThreeView {
	static Model = ObjectModel;
	model!:ObjectModel;

	controller?:ObjectController;

	@components(schema(ObjectModel).behaviours, Component)
	behaviours!:ComponentList<Component>;

	setPosition(position:Vector3) {
		if(!this.controller) return;
		this.controller.setPosition(position);
	}

	onInit() {
		super.onInit();

		this.controller = this.findController(ObjectController);

		this.watch(schema(ObjectModel).position, position => {
			this.setPosition(position);
		}, {deep, throttle: 1});
		this.watch(schema(ObjectModel).scale, scale => {
			this.setScale(scale);
		}, {deep, throttle: 1});
	}
}
