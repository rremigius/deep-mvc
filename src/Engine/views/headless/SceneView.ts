import ISceneView, {ISceneViewSymbol} from "@/Engine/views/common/ISceneView";
import ViewRoot from "@/Engine/views/headless/ViewRoot";

export default class SceneView extends ViewRoot implements ISceneView {
	static ViewInterface = ISceneViewSymbol;
}
