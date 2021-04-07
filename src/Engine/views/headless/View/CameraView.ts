import ICameraView, {ICameraViewSymbol} from "@/Engine/views/common/IObjectView/ICameraView";
import ObjectView from "@/Engine/views/headless/ObjectView";

export default class CameraView extends ObjectView implements ICameraView {
	static ViewInterface = ICameraViewSymbol;

	setAspectRatio(ratio: number): void {
	}
}
