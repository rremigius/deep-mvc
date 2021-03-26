import ICameraView from "@/Engine/views/common/IObjectView/ICameraView";
import ObjectView from "@/Engine/views/headless/ObjectView";
import {injectable} from "@/Engine/views/dependencies";
import headlessContainer from "@/Engine/views/headless/dependencies";

@injectable(headlessContainer, "ICameraView")
export default class CameraView extends ObjectView implements ICameraView {
	setAspectRatio(ratio: number): void {
	}
}
