import {EventDispatcher, Object3D, Vector3} from "three";
import {injectableXRObjectRender} from "@/classes/renderers/inversify";
import threeContainer from "@/classes/renderers/threejs/inversify";
import {decorate, inject, injectable, optional} from "inversify";
import Log from "@utils/log";
import XRVector3, {SparseVector3} from "@/classes/renderers/common/XRVector3";
import XRObjectRenderInterface from "@/classes/renderers/common/XRObjectRenderInterface";

const log = Log.instance("renderers/three/xrthreeobject");

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
@injectableXRObjectRender(threeContainer, "XRObjectRenderInterface")
export default class ThreeObject implements XRObjectRenderInterface<Object3D> {
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
	add(object: XRObjectRenderInterface<Object3D>) {
		this.object3D.add(object.getRenderObject());
		return this;
	}
	remove(object: XRObjectRenderInterface<Object3D>) {
		this.object3D.remove(object.getRenderObject());
		return this;
	}
	getPosition(): XRVector3 {
		return this.object3D.position;
	}
	getScale(): XRVector3 {
		return this.object3D.scale;
	}
	setPosition(position: XRVector3|SparseVector3): void {
		if(position instanceof XRVector3) {
			this.object3D.position.set(position.x, position.y, position.z);
			return;
		}
		applySparseVector(this.object3D.position, position);
	}
	setScale(scale: XRVector3): void {
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
