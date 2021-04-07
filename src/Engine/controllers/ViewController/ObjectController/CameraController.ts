import ObjectController from "@/Engine/controllers/ViewController/ObjectController";
import CameraModel from "@/Engine/models/ObjectModel/CameraModel";
import ICameraView, {ICameraViewSymbol} from "@/Engine/views/common/IObjectView/ICameraView";

export default class CameraController extends ObjectController {
	static ModelClass = CameraModel;
	static ViewInterface = ICameraViewSymbol;

	// Type overrides
	model!:CameraModel;
	get view() { return super.view as ICameraView };

	setAspectRatio(ratio:number) {
		this.view.setAspectRatio(ratio);
	}
}
