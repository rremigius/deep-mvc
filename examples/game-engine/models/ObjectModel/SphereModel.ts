import ObjectModel from "../ObjectModel";
import {property, required} from "mozel";

export default class SphereModel extends ObjectModel {
	static get type() { return 'Sphere' }

	@property(Number, {required, default: 1})
	radius!:number;

	@property(String, {required, default: '#ffffff'})
	color!:string;

	@property(Number)
	segments?:number;
}
