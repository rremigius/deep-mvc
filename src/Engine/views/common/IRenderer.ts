import ISceneView from "@/Engine/views/common/ISceneView";
import ICameraView from "@/Engine/views/common/IObjectView/ICameraView";

export default interface IViewer {
	attachTo(element:HTMLElement):void;
	detach():void;
	render(scene:ISceneView, camera:ICameraView):void;
	getSize():{width:number, height:number};
	setSize(width:number, height:number):void;
	destroy():void;
}
