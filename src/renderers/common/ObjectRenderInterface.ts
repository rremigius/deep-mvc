import XRVector3, {SparseVector3} from "@/classes/renderers/common/XRVector3";

export default interface ObjectRenderInterface<T> {
	getRenderObject():T;

	add(object:ObjectRenderInterface<T>): this;
	remove(object:ObjectRenderInterface<T>): this;

	getPosition():XRVector3;
	setPosition(position:XRVector3|SparseVector3):void;
	getScale():XRVector3;
	setScale(scale:XRVector3|SparseVector3):void;
	isVisible():boolean;
	setVisible(visible:boolean):void;
	setName(name:string):void;
}
