import View from "@/View";
import {Object3D} from "three";
import Vector3, {SparseVector3} from "@/Engine/views/common/Vector3";
import {alphanumeric, deep, schema} from "mozel";
import ViewModel from "@/ViewModel";
import {ThreeClickEvent} from "@/Engine/views/threejs/ThreeEngineView";

export interface ThreeViewRoot {
	gid: alphanumeric;
	onClick(event:ThreeClickEvent):void;
}

export function root(Class:typeof Object3D) {
	return class extends Class {
		public gid: alphanumeric = 0;
		onClick(event:ThreeClickEvent){};
	}
}
const RootObject3D = root(Object3D);
export default class ThreeView extends View {
	private _object3D!:Object3D & ThreeViewRoot;
	get object3D() { return this._object3D };

	private parentObject3D?:Object3D;

	onInit() {
		super.onInit();
		this._object3D = this.createObject3D();
		this._object3D.gid = this.gid;
		this._object3D.onClick = this.threeClick.bind(this); // To be called by ThreeEngineView
	}

	setParent(parent?:ThreeView) {
		super.setParent(parent);
		if(parent) {
			this.parentObject3D = parent.object3D;
		}
	}
	createObject3D() {
		// For override
		return new RootObject3D();
	}
	threeClick(event:ThreeClickEvent) {
		this.onThreeClick(event);
		this.click();
	}

	// Note: adding the object3D is done by the child view, onEnable

	onViewRemove(view: ThreeView) {
		super.onViewRemove(view);
		this.object3D.remove(view.object3D);
	}

	onSetPosition(position: Vector3 | SparseVector3) {
		super.onSetPosition(position);
		if(position instanceof Vector3) {
			this.object3D.position.set(position.x, position.y, position.z);
		} else {
			applySparseVector(this.object3D.position, position);
		}
	}

	onSetScale(scale:number) {
		super.onSetScale(scale);
		this.object3D.scale.set(scale, scale, scale);
	}

	onSetVisible(visible: boolean) {
		super.onSetVisible(visible);
		this.object3D.visible = visible;
	}

	onEnable() {
		super.onEnable();
		if(this.parentObject3D) {
			this.parentObject3D.add(this.object3D);
		}
	}

	onDisable() {
		super.onDisable();
		if(this.parentObject3D) {
			this.parentObject3D.remove(this.object3D);
		}
	}

	onThreeClick(event:ThreeClickEvent) {
		// For override
	}
}

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
