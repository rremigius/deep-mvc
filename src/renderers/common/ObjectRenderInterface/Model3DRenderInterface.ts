import ObjectRenderInterface from "../ObjectRenderInterface";
import Model3DModel from "@common/models/Object3DModel/Model3DModel";

export default interface Model3DRenderInterface<T> extends ObjectRenderInterface<T> {
    load(xrModel3D: Model3DModel):Promise<this>;
}
