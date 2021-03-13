import ObjectRenderInterface from "@/renderers/common/ObjectRenderInterface";

export enum LightType {
	AMBIENT
}

export default interface LightRenderInterface<T> extends ObjectRenderInterface<T> {
	setType(type:LightType):boolean;
	setColor(color:number|string):boolean;
}
