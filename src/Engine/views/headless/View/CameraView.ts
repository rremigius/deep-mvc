import ICameraView, {ICameraViewSymbol} from "@/Engine/views/common/IObjectView/ICameraView";
import ViewRoot from "@/Engine/views/headless/ViewRoot";

export default class CameraView extends ViewRoot implements ICameraView {
	static ViewInterface = ICameraViewSymbol;

	setAspectRatio(ratio: number): void {
	}
}
