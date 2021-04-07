import ControllerModel from "@/ControllerModel";
import {property} from "mozel";

export default class OrbitControlsModel extends ControllerModel {
	static get type() { return 'OrbitControls' }

	@property(Number) 	rotateSpeed?:number;
	@property(Number) 	minDistance?:number;
	@property(Number) 	maxDistance?:number;
	@property(Boolean) 	enableZoom?:boolean;
	@property(Number) 	maxPolarAngle?:number;
	// TODO: complete
}
