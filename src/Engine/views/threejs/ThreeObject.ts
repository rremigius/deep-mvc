import IObjectView, {IObjectViewSymbol} from "@/Engine/views/common/IObjectView";
import ThreeViewRoot from "@/Engine/views/threejs/ThreeViewRoot";

export default class ThreeObject extends ThreeViewRoot implements IObjectView {
	static ViewInterface = IObjectViewSymbol;
}
