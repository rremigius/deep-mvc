import ObjectController from "@/Controller/ObjectController";
import Log from "@/log";
import ImageModel from "@/models/Object3DModel/ImageModel";
import ObjectRenderInterface from "@/renderers/common/ObjectRenderInterface";
import {injectable} from "@/Controller/inversify";
import ImageRenderInterface from "@/renderers/common/ObjectRenderInterface/ImageRenderInterface";

const log = Log.instance("Engine/Object/Image");

@injectable()
export default class ImageController extends ObjectController {
	static ModelClass = ImageModel;
	private imageRender: ImageRenderInterface = this.renderFactory.create<ImageRenderInterface>("ImageRenderInterface");

	log = log;

	get xrImage() {
		return <ImageModel>this.model;
	}

	async createObjectRender(): Promise<ObjectRenderInterface> {
		return this.imageRender.load(this.xrImage);
	}
}
