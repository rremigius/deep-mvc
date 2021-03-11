import XRObjectRenderInterface from "@/classes/renderers/common/XRObjectRenderInterface";

export enum LightType {
	AMBIENT
}

export default interface LightRenderInterface<T> extends XRObjectRenderInterface<T> {
	setType(type:LightType):boolean;
	setColor(color:number|string):boolean;
}
