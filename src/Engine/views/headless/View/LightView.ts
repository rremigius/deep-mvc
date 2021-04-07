import ILightView, {ILightViewSymbol, LightType} from "@/Engine/views/common/IObjectView/ILightView";
import ObjectView from "@/Engine/views/headless/ObjectView";

export default class LightView extends ObjectView implements ILightView {
	static ViewInterface = ILightViewSymbol;

	setColor(color: number | string): boolean {
		return false;
	}

	setType(type: LightType): boolean {
		return false;
	}

}
