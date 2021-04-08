import ControllerModel from "@/ControllerModel";
import {property, required} from "mozel";

export type OrbitControlSettings = {
	enableZoom:boolean,
	rotateSpeed:number,
	minDistance:number,
	maxDistance:number,
	maxPolarAngle:number
}

export default class OrbitControlsModel extends ControllerModel {
	static get type() { return 'OrbitControls' }
	static get defaults():OrbitControlSettings {
		return {
			rotateSpeed: 0.5,
			minDistance: 1,
			maxDistance: 10,
			maxPolarAngle: 1.5,
			enableZoom: false
		}
	}

	@property(Number, {required, default: 0.5})
	rotateSpeed!:number;
	@property(Number, {required, default: 1})
	minDistance!:number;
	@property(Number, {required, default: 10})
	maxDistance!:number;
	@property(Boolean, {required})
	enableZoom!:boolean;
	@property(Number, {required, default: 1.5})
	maxPolarAngle!:number;
	// TODO: complete
}
