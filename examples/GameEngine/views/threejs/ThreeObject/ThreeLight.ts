import {AmbientLight, Color, Light} from "three";
import ThreeObject from "../ThreeObject";
import LightModel from "@examples/GameEngine/models/ObjectModel/LightModel";
import {LightType} from "@examples/GameEngine/views/common/Light";

export default class ThreeLight extends ThreeObject {
	static Model = LightModel;
	model!:LightModel;

	light!:Light;
	color!:number|string;
	lightType!:LightType;

	onInit() {
		super.onInit();

		// TODO: make configurable (reactive)

		this.lightType = LightType.AMBIENT;
		this.color = 0xffffff;
		this.light = this.createLight(this.lightType);
		this.object3D.add(this.light);
	}

	createLight(type:LightType) {
		let light:Light;
		switch(type) {
			case LightType.AMBIENT: light = new AmbientLight(this.color); break;
			default: light = new Light(this.color);
		}
		return light;
	}

	setType(type:LightType) {
		if(type === this.lightType) return false;

		this.lightType = type;

		this.object3D.remove(this.light);
		this.light = this.createLight(this.lightType);
		this.object3D.add(this.light);

		return true;
	}

	setColor(color:number|string) {
		this.light.color = new Color(color);
		return true;
	}
}
