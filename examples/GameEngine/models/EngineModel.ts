import {Collection, collection, property, reference, required} from "mozel";
import SceneModel from "@examples/GameEngine/models/SceneModel";
import CameraModel from "@examples/GameEngine/models/ObjectModel/CameraModel";
import ViewModel from "@/View/ViewModel";
import ObjectModel from "@examples/GameEngine/models/ObjectModel";

export default class EngineModel extends ViewModel {
	static get type() { return 'Engine' };

	@property(SceneModel, {required})
	scene!:SceneModel;

	@property(CameraModel, {reference})
	camera?:CameraModel;

	@collection(ObjectModel, {reference})
	selection!:Collection<ObjectModel>;
}
