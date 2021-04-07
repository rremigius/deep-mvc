import ObjectModel from "@/Engine/models/ObjectModel";
import {property} from "mozel";
import OrbitControlsModel from "@/Engine/models/ObjectModel/CameraModel/OrbitControlsModel";

export default class CameraModel extends ObjectModel {
	static get type() { return 'Camera' };

	@property(OrbitControlsModel)
	orbitControls?:OrbitControlsModel;
}
