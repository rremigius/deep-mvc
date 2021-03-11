import ObjectRenderInterface from "../XRObjectRenderInterface";
import XRModel3DModel from "@common/models/XRObject3DModel/XRModel3DModel";

export default interface Model3DRenderInterface<T> extends ObjectRenderInterface<T> {
    load(xrModel3D: XRModel3DModel):Promise<this>;
}
