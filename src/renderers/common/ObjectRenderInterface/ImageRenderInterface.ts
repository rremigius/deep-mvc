import XRImageModel from "@common/models/XRObject3DModel/XRImageModel";
import XRObjectRenderInterface from "@/classes/renderers/common/XRObjectRenderInterface";

export default interface ImageRenderInterface<T> extends XRObjectRenderInterface<T> {
	load(xrImage: XRImageModel):Promise<this>;
}
