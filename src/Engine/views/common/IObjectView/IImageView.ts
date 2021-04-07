import ImageModel from "@/Engine/models/ObjectModel/ImageModel";
import IObjectView from "@/Engine/views/common/IObjectView";

export default interface IImageView extends IObjectView {
	load(model: ImageModel):Promise<this>;
}
export const IImageViewSymbol = Symbol.for("IImageView");
