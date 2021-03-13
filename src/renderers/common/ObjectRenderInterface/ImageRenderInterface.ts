import ImageModel from "@common/models/Object3DModel/ImageModel";
import ObjectRenderInterface from "@/renderers/common/ObjectRenderInterface";

export default interface ImageRenderInterface<T> extends ObjectRenderInterface<T> {
	load(xrImage: ImageModel):Promise<this>;
}
