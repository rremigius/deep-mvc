import IObjectView from "@/Engine/views/common/IObjectView";

export enum LightType {
	AMBIENT
}

export default interface ILightView extends IObjectView {
	setType(type:LightType):boolean;
	setColor(color:number|string):boolean;
}
export const ILightViewSymbol = Symbol.for("ILightViewSymbol");
