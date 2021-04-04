import IView from "../IObjectView";
import Model3DModel from "@/Engine/models/ObjectModel/Model3DModel";

export default interface IModel3DView extends IView {
    load(xrModel3D: Model3DModel):Promise<this>;
}
export const IModel3DViewSymbol = Symbol.for("IModel3DView");
