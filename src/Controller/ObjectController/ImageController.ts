import ObjectController from "@/Controller/ObjectController";
import Log from "@/log";
import ImageModel from "@/models/Object3DModel/ImageModel";
import ObjectRenderInterface from "@/renderers/common/ObjectRenderInterface";
import {injectableController} from "@/Controller/inversify";
import ImageRenderInterface from "@/renderers/common/ObjectRenderInterface/ImageRenderInterface";

const log = Log.instance("Engine/Object/Image");

@injectableController()
export default class ImageController extends ObjectController {
	static ModelClass = ImageModel;
	private imageRender: ImageRenderInterface<unknown> = this.renderFactory.create<ImageRenderInterface<unknown>>("ImageRenderInterface");

	get xrImage() {
		return <ImageModel>this.model;
	}

	async createObjectRender(): Promise<ObjectRenderInterface<unknown>> {
		return this.imageRender.load(this.xrImage);
	}
}
