import SceneRenderInterface from "@/renderers/common/ObjectRenderInterface/SceneRenderInterface";
import ObjectRender from "@/renderers/headless/ObjectRender";
import {injectable} from "@/renderers/inversify";
import headlessContainer from "@/renderers/headless/inversify";

@injectable(headlessContainer, "SceneRenderInterface")
export default class SceneRender extends ObjectRender implements SceneRenderInterface {

}
