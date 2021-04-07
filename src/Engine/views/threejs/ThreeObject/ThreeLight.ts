import {AmbientLight, Color, Light} from "three";
import ILightView, {ILightViewSymbol, LightType} from "@/Engine/views/common/IObjectView/ILightView";
import ThreeObject from "../ThreeObject";

export default class ThreeLight extends ThreeObject implements ILightView {
	static ViewInterface = ILightViewSymbol;

	light:Light;
	color:number|string;
	lightType:LightType;

	constructor() {
		super();
		this.lightType = LightType.AMBIENT;
		this.color = 0xffffff;
		this.light = this.createLight(this.lightType);
		this.getObject3D().add(this.light);
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
