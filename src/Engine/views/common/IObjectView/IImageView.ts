import ImageModel from "@/Engine/models/ObjectModel/ImageModel";
import IView from "@/Engine/views/common/IObjectView";

export default interface IImageView extends IView {
	load(model: ImageModel):Promise<this>;
}
export const IImageViewSymbol = Symbol.for("IImageView");
