import ISceneView from "@/Engine/views/common/ISceneView";
import ICameraView from "@/Engine/views/common/IObjectView/ICameraView";

export default interface IRenderer {
	attachTo(element:HTMLElement):void;
	detach():void;
	render(scene:ISceneView, camera:ICameraView):void;
	getSize():{width:number, height:number};
	setSize(width:number, height:number):void;
	destroy():void;
	getDOMElement():HTMLElement;
}
export const IRendererSymbol = Symbol.for("IRenderer");
