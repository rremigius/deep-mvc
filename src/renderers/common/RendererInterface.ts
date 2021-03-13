import SceneRenderInterface from "@/renderers/common/ObjectRenderInterface/SceneRenderInterface";
import CameraRenderInterface from "@/renderers/common/ObjectRenderInterface/CameraRenderInterface";

export default interface RendererInterface<T> {
	render(scene:SceneRenderInterface<T>, camera:CameraRenderInterface<T>):void;
	getDOMElement():HTMLElement;
	getSize():{width:number, height:number};
	setSize(width:number, height:number):void;
}
