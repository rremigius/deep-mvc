import ISceneView, {ISceneViewSymbol} from "@/Engine/views/common/ISceneView";
import {injectable} from "@/Engine/views/dependencies";
import headlessContainer from "@/Engine/views/headless/dependencies";
import ObjectView from "@/Engine/views/headless/ObjectView";

@injectable(headlessContainer, ISceneViewSymbol)
export default class SceneView extends ObjectView implements ISceneView {

}
