import {EventDispatcher, Object3D, Vector3} from "three";
import {injectableObjectRender} from "@/renderers/inversify";
import threeContainer from "@/renderers/threejs/inversify";
import {decorate, inject, injectable, optional} from "inversify";
import {default as V3, SparseVector3} from "@/renderers/common/Vector3";
import ObjectRenderInterface from "@/renderers/common/ObjectRenderInterface";

function applySparseVector(target:Vector3, source:SparseVector3) {
	if(source.x !== undefined) {
		target.x = source.x;
	}
	if(source.y !== undefined) {
		target.y = source.y;
	}
	if(source.z !== undefined) {
		target.z = source.z;
	}
}

decorate(injectable(), Object3D);
decorate(injectable(), EventDispatcher);
@injectableObjectRender(threeContainer, "ObjectRenderInterface")
export default class ThreeObject implements ObjectRenderInterface<Object3D> {
	readonly object3D:Object3D;
	constructor(@inject("object3d") @optional() object3D?:Object3D) {
		this.object3D = object3D ? object3D : this.createObject3D();
	}
	protected createObject3D() {
		return new Object3D();
	}
	public getRenderObject() {
		return this.object3D;
	}
	add(object: ObjectRenderInterface<Object3D>) {
		this.object3D.add(object.getRenderObject());
		return this;
	}
	remove(object: ObjectRenderInterface<Object3D>) {
		this.object3D.remove(object.getRenderObject());
		return this;
	}
	getPosition() {
		return this.object3D.position;
	}
	getScale() {
		return this.object3D.scale;
	}
	setPosition(position: V3|SparseVector3) {
		if(position instanceof V3) {
			this.object3D.position.set(position.x, position.y, position.z);
			return;
		}
		applySparseVector(this.object3D.position, position);
	}
	setScale(scale: V3) {
		this.object3D.scale.set(scale.x, scale.y, scale.z);
		applySparseVector(this.object3D.scale, scale);
	}
	isVisible() {
		return this.object3D.visible;
	}
	setVisible(visible:boolean) {
		this.object3D.visible = visible;
	}
	setName(name:string) {
		this.object3D.name = name;
	}
}
