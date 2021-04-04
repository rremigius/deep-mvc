import ControllerModel from "@/ControllerModel";
import {Collection, collection, property, required} from "mozel";
import Vector3Model from "@/Engine/models/Vector3Model";

export default class ViewModel extends ControllerModel {
	@property(String, {required, default: "View"})
	name!:string;

	@property(Number, {required, default: 1})
	scale!:number;

	@property(Vector3Model, {required})
	position!:Vector3Model;

	@collection(ViewModel)
	children!:Collection<ViewModel>;
}
