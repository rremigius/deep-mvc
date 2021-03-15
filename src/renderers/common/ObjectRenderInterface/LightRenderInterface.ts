import ObjectRenderInterface from "@/renderers/common/ObjectRenderInterface";

export enum LightType {
	AMBIENT
}

export default interface LightRenderInterface extends ObjectRenderInterface {
	setType(type:LightType):boolean;
	setColor(color:number|string):boolean;
}
