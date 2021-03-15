import ObjectRender from "@/renderers/headless/ObjectRender";
import Model3DRenderInterface from "@/renderers/common/ObjectRenderInterface/Model3DRenderInterface";
import Model3DModel from "@/models/Object3DModel/Model3DModel";
import {injectable} from "@/renderers/inversify";
import headlessContainer from "@/renderers/headless/inversify";

injectable(headlessContainer, "Model3DRenderInterface")
export default class Model3DRender extends ObjectRender implements Model3DRenderInterface {
	load(xrModel3D: Model3DModel): Promise<this> {
		return Promise.resolve(this);
	}
}
