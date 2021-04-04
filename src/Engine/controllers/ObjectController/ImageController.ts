import ObjectController from "@/Engine/controllers/ObjectController";
import Log from "@/log";
import ImageModel from "@/Engine/models/ObjectModel/ImageModel";
import IView from "@/Engine/views/common/IObjectView";
import {injectable} from "@/Controller/dependencies";
import IImageView, {IImageViewSymbol} from "@/Engine/views/common/IObjectView/IImageView";

const log = Log.instance("Engine/Object/Image");

@injectable()
export default class ImageController extends ObjectController {
	static ModelClass = ImageModel;
	private imageView: IImageView = this.viewFactory.create<IImageView>(IImageViewSymbol);

	log = log;

	get xrImage() {
		return <ImageModel>this.model;
	}

	async createObjectView(): Promise<IView> {
		return this.imageView.load(this.xrImage);
	}
}
