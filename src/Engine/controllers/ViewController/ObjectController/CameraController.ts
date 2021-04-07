import ObjectController from "@/Engine/controllers/ViewController/ObjectController";
import CameraModel from "@/Engine/models/ObjectModel/CameraModel";
import ICameraView, {ICameraViewSymbol} from "@/Engine/views/common/IObjectView/ICameraView";
import {controller} from "@/Controller";
import {schema} from "mozel";
import OrbitController from "@/Engine/controllers/ViewController/ObjectController/CameraController/OrbitController";
import ControllerSlot from "@/Controller/ControllerSlot";

export default class CameraController extends ObjectController {
	static ModelClass = CameraModel;
	static ViewInterface = ICameraViewSymbol;

	// Type overrides
	model!:CameraModel;
	get view() { return super.view as ICameraView };

	@controller(schema(CameraModel).orbitControls, OrbitController)
	orbitController!:ControllerSlot<OrbitController>;

	setAspectRatio(ratio:number) {
		this.view.setAspectRatio(ratio);
	}
}
