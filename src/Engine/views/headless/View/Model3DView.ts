import IModel3DView, {IModel3DViewSymbol} from "@/Engine/views/common/IObjectView/IModel3DView";
import Model3DModel from "@/Engine/models/ObjectModel/Model3DModel";
import ObjectView from "@/Engine/views/headless/ObjectView";

export default class Model3DView extends ObjectView implements IModel3DView {
	static ViewInterface = IModel3DViewSymbol;

	load(xrModel3D: Model3DModel): Promise<this> {
		return Promise.resolve(this);
	}
}
