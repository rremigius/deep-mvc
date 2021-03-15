import LightRenderInterface, {LightType} from "@/renderers/common/ObjectRenderInterface/LightRenderInterface";
import ObjectRender from "@/renderers/headless/ObjectRender";
import headlessContainer from "@/renderers/headless/inversify";
import {injectable} from "@/renderers/inversify";

injectable(headlessContainer, "LightRenderInterface")
export default class LightRender extends ObjectRender implements LightRenderInterface {
	setColor(color: number | string): boolean {
		return false;
	}

	setType(type: LightType): boolean {
		return false;
	}

}
