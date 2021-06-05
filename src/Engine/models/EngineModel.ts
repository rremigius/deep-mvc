import {Collection, collection, property, reference, required} from "mozel";
import SceneModel from "@/Engine/models/SceneModel";
import CameraModel from "@/Engine/models/ObjectModel/CameraModel";
import ViewModel from "@/ViewModel";
import ObjectModel from "@/Engine/models/ObjectModel";

export default class EngineModel extends ViewModel {
	static get type() { return 'Engine' };

	@property(SceneModel, {required})
	scene!:SceneModel;

	@property(CameraModel, {reference})
	camera?:CameraModel;

	@collection(ObjectModel, {reference})
	selection!:Collection<ObjectModel>;
}
