import {injectable} from "@/renderers/inversify";
import ImageRenderInterface from "@/renderers/common/ObjectRenderInterface/ImageRenderInterface";
import ImageModel from "@/models/Object3DModel/ImageModel";
import ObjectRender from "@/renderers/headless/ObjectRender";
import headlessContainer from "@/renderers/headless/inversify";

@injectable(headlessContainer, "ImageRenderInterface")
export default class ImageRender extends ObjectRender implements ImageRenderInterface {
	load(xrImage:ImageModel): Promise<this> {
		return Promise.resolve(this);
	}
}
