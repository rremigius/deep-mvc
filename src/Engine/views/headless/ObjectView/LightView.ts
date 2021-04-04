import ILightView, {ILightViewSymbol, LightType} from "@/Engine/views/common/IObjectView/ILightView";
import ObjectView from "@/Engine/views/headless/ObjectView";
import headlessContainer from "@/Engine/views/headless/dependencies";
import {injectable} from "@/Engine/views/dependencies";

injectable(headlessContainer, ILightViewSymbol)
export default class LightView extends ObjectView implements ILightView {
	setColor(color: number | string): boolean {
		return false;
	}

	setType(type: LightType): boolean {
		return false;
	}

}
