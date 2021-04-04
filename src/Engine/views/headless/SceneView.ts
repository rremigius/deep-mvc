import ISceneView, {ISceneViewSymbol} from "@/Engine/views/common/ISceneView";
import ObjectView from "@/Engine/views/headless/ObjectView";
import {injectable} from "@/Engine/views/dependencies";
import headlessContainer from "@/Engine/views/headless/dependencies";

@injectable(headlessContainer, ISceneViewSymbol)
export default class SceneView extends ObjectView implements ISceneView {

}
