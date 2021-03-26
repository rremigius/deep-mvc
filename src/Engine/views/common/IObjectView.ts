import Vector3, {SparseVector3} from "@/Engine/views/common/Vector3";
import IView from "@/IView";

export default interface IObjectView extends IView {
	getPosition():Vector3;
	setPosition(position:Vector3|SparseVector3):void;
	getScale():Vector3;
	setScale(scale:Vector3|SparseVector3):void;
	isVisible():boolean;
	setVisible(visible:boolean):void;
	setName(name:string):void;
}
