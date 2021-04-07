import ObjectController from "../ObjectController";
import {ILightViewSymbol} from "@/Engine/views/common/IObjectView/ILightView";
import LightModel from "@/Engine/models/ObjectModel/LightModel";

export default class LightController extends ObjectController {
	static ModelClass = LightModel;
	static ViewInterface = ILightViewSymbol;
}
