import ObjectView from "@/Engine/views/headless/ObjectView";
import IModel3DView from "@/Engine/views/common/IObjectView/IModel3DView";
import Model3DModel from "@/Engine/models/ObjectModel/Model3DModel";
import {injectable} from "@/Engine/views/dependencies";
import headlessContainer from "@/Engine/views/headless/dependencies";

injectable(headlessContainer, "IModel3DView")
export default class Model3DView extends ObjectView implements IModel3DView {
	load(xrModel3D: Model3DModel): Promise<this> {
		return Promise.resolve(this);
	}
}
