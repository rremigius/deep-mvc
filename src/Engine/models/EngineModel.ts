import ControllerModel from "@/ControllerModel";
import {property, reference, required} from "mozel";
import SceneModel from "@/Engine/models/SceneModel";
import CameraModel from "@/Engine/models/ObjectModel/CameraModel";

export default class EngineModel extends ControllerModel {
	static get type() { return 'Engine' };

	@property(SceneModel, {required})
	scene!:SceneModel;

	@property(CameraModel, {reference})
	camera?:CameraModel;
}
