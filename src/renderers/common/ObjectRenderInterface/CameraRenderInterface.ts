import ObjectRenderInterface from "../XRObjectRenderInterface";

export default interface CameraRenderInterface<T> extends ObjectRenderInterface<T> {
	setAspectRatio(ratio:number):void;
}
