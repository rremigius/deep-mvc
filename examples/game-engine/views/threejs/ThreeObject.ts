import ThreeView from "@examples/game-engine/views/threejs/ThreeView";
import ObjectModel from "@examples/game-engine/models/ObjectModel";
import Component, {components} from "@/Component";
import {deep, schema} from "mozel";
import ComponentList from "@/Component/ComponentList";
import ObjectController from "@examples/game-engine/controllers/ObjectController";
import Vector3, {applySparseVector, SparseVector3} from "@examples/game-engine/views/common/Vector3";

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
			this.applyPosition(position);
		}, {throttle:1, deep});

		this.watch(schema(ObjectModel).scale, scale => {
			this.applyScale(scale);
		});
	}

	applyPosition(position: Vector3 | SparseVector3) {
		if(position instanceof Vector3) {
			this.object3D.position.set(position.x, position.y, position.z);
		} else {
			applySparseVector(this.object3D.position, position);
		}
	}

	applyScale(scale:number) {
		this.object3D.scale.set(scale, scale, scale);
	}
}
