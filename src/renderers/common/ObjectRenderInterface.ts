import Vector3, {SparseVector3} from "@/renderers/common/Vector3";

export default interface ObjectRenderInterface<T> {
	getRenderObject():T;

	add(object:ObjectRenderInterface<T>): this;
	remove(object:ObjectRenderInterface<T>): this;

	getPosition():Vector3;
	setPosition(position:Vector3|SparseVector3):void;
	getScale():Vector3;
	setScale(scale:Vector3|SparseVector3):void;
	isVisible():boolean;
	setVisible(visible:boolean):void;
	setName(name:string):void;
}
