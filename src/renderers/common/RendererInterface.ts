import SceneRenderInterface from "@/renderers/common/ObjectRenderInterface/SceneRenderInterface";
import CameraRenderInterface from "@/renderers/common/ObjectRenderInterface/CameraRenderInterface";

export default interface RendererInterface {
	attachTo(element:HTMLElement):void;
	detach():void;
	render(scene:SceneRenderInterface, camera:CameraRenderInterface):void;
	getSize():{width:number, height:number};
	setSize(width:number, height:number):void;
	destroy():void;
}
