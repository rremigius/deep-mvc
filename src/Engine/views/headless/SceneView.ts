import ISceneView, {ISceneViewSymbol} from "@/Engine/views/common/ISceneView";
import ObjectView from "@/Engine/views/headless/ObjectView";

export default class SceneView extends ObjectView implements ISceneView {
	static ViewInterface = ISceneViewSymbol;
}
