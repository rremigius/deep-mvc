import {injectable} from "@/Engine/views/dependencies";
import IImageView from "@/Engine/views/common/IObjectView/IImageView";
import ImageModel from "@/Engine/models/ObjectModel/ImageModel";
import ObjectView from "@/Engine/views/headless/ObjectView";
import headlessContainer from "@/Engine/views/headless/dependencies";

@injectable(headlessContainer, "IImageView")
export default class ImageView extends ObjectView implements IImageView {
	load(xrImage:ImageModel): Promise<this> {
		return Promise.resolve(this);
	}
}
