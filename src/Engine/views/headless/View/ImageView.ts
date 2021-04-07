import IImageView, {IImageViewSymbol} from "@/Engine/views/common/IObjectView/IImageView";
import ImageModel from "@/Engine/models/ObjectModel/ImageModel";
import ObjectView from "@/Engine/views/headless/ObjectView";

export default class ImageView extends ObjectView implements IImageView {
	static ViewInterface = IImageViewSymbol;

	load(xrImage:ImageModel): Promise<this> {
		return Promise.resolve(this);
	}
}
