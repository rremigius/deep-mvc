import {injectable} from "@/Engine/views/dependencies";
import IImageView, {IImageViewSymbol} from "@/Engine/views/common/IObjectView/IImageView";
import ImageModel from "@/Engine/models/ObjectModel/ImageModel";
import View from "@/Engine/views/headless/View";
import headlessContainer from "@/Engine/views/headless/dependencies";
import ObjectView from "@/Engine/views/headless/ObjectView";

@injectable(headlessContainer, IImageViewSymbol)
export default class ImageView extends ObjectView implements IImageView {
	load(xrImage:ImageModel): Promise<this> {
		return Promise.resolve(this);
	}
}
