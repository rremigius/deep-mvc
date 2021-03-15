import ObjectRenderInterface from "../ObjectRenderInterface";

export default interface CameraRenderInterface extends ObjectRenderInterface {
	setAspectRatio(ratio:number):void;
}
