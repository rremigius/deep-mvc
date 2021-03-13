import ObjectRenderInterface from "../ObjectRenderInterface";

export default interface CameraRenderInterface<T> extends ObjectRenderInterface<T> {
	setAspectRatio(ratio:number):void;
}
