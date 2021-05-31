import ThreeView from "@/Engine/views/threejs/ThreeView";
import ObjectModel from "@/Engine/models/ObjectModel";
import Component, {components} from "@/Component";
import {deep, schema} from "mozel";
import ComponentList from "@/Component/ComponentList";

export default class ThreeObject extends ThreeView {
	static Model = ObjectModel;
	model!:ObjectModel;

	@components(schema(ObjectModel).behaviours, Component)
	behaviours!:ComponentList<Component>;

	onInit() {
		super.onInit();

		this.watch(schema(ObjectModel).position, position => {
			this.setPosition(position);
		}, {deep, throttle: 1});
		this.watch(schema(ObjectModel).scale, scale => {
			this.setScale(scale);
		}, {deep, throttle: 1});
	}
}
