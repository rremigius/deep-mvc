import ILightView, {LightType} from "@/Engine/views/common/IObjectView/ILightView";
import ObjectView from "@/Engine/views/headless/ObjectView";
import headlessContainer from "@/Engine/views/headless/dependencies";
import {injectable} from "@/Engine/views/dependencies";

injectable(headlessContainer, "ILightView")
export default class LightView extends ObjectView implements ILightView {
	setColor(color: number | string): boolean {
		return false;
	}

	setType(type: LightType): boolean {
		return false;
	}

}
