import ImageModel from "@/models/Object3DModel/ImageModel";
import ObjectRenderInterface from "@/renderers/common/ObjectRenderInterface";

export default interface ImageRenderInterface extends ObjectRenderInterface {
	load(model: ImageModel):Promise<this>;
}
