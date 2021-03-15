import CameraRenderInterface from "@/renderers/common/ObjectRenderInterface/CameraRenderInterface";
import ObjectRender from "@/renderers/headless/ObjectRender";
import {injectable} from "@/renderers/inversify";
import headlessContainer from "@/renderers/headless/inversify";

@injectable(headlessContainer, "CameraRenderInterface")
export default class CameraRender extends ObjectRender implements CameraRenderInterface {
	setAspectRatio(ratio: number): void {
	}
}
