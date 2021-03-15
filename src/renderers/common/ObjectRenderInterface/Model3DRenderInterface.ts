import ObjectRenderInterface from "../ObjectRenderInterface";
import Model3DModel from "@/models/Object3DModel/Model3DModel";

export default interface Model3DRenderInterface extends ObjectRenderInterface {
    load(xrModel3D: Model3DModel):Promise<this>;
}
