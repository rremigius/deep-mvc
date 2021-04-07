import Model3DModel from "@/Engine/models/ObjectModel/Model3DModel";
import IObjectView from "@/Engine/views/common/IObjectView";

export default interface IModel3DView extends IObjectView {
    load(xrModel3D: Model3DModel):Promise<this>;
}
export const IModel3DViewSymbol = Symbol.for("IModel3DView");
