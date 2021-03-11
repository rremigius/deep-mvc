import XRSceneRenderInterface from "@/classes/renderers/common/XRObjectRenderInterface/XRSceneRenderInterface";
import XRCameraRenderInterface from "@/classes/renderers/common/XRObjectRenderInterface/XRCameraRenderInterface";

export default interface RendererInterface<T> {
	render(scene:XRSceneRenderInterface<T>, camera:XRCameraRenderInterface<T>):void;
	getDOMElement():HTMLElement;
	getSize():{width:number, height:number};
	setSize(width:number, height:number):void;
}
