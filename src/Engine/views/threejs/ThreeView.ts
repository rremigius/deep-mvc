import View, {ViewClickEvent} from "@/View";
import {Object3D} from "three";
import Vector3, {SparseVector3} from "@/Engine/views/common/Vector3";
import {alphanumeric, deep, immediate, schema} from "mozel";
import ViewModel from "@/ViewModel";
import {ThreeClickEvent} from "@/Engine/views/threejs/ThreeEngineView";

export interface ThreeViewRoot {
	gid: alphanumeric;
	onClick(event:ThreeClickEvent):void;
}

export function extendForRootObject3D(Class:typeof Object3D) {
	return class extends Class {
		public gid: alphanumeric = 0;
		onClick(event:ThreeClickEvent){};
	}
}
const RootObject3D = extendForRootObject3D(Object3D);
export default class ThreeView extends View {
	private _object3D!:Object3D & ThreeViewRoot;
	get object3D() { return this._object3D };

	init(model: ViewModel) {
		super.init(model);
		this._object3D = this.createRootObject3D();

		model.$watch(schema(ViewModel).position, position => {
			this.setPosition(position);
		}, {immediate, deep, throttle: 1});
		model.$watch(schema(ViewModel).scale, scale => {
			this.setScale(scale);
		}, {immediate, deep, throttle: 1});
	}

	createRootObject3D() {
		const object3D = this.createObject3D();
		object3D.gid = this.gid;
		object3D.onClick = this.threeClick.bind(this); // To be called by ThreeEngineView
		return object3D;
	}
	createObject3D() {
		// For override
		return new RootObject3D();
	}
	threeClick(event:ThreeClickEvent) {
		this.onThreeClick(event);
		this.click();
	}

	onViewAdd(view: ThreeView) {
		super.onViewAdd(view);
		this.object3D.add(view.object3D);
	}

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
		this.object3D.visible = true;
	}

	onDisable() {
		super.onDisable();
		this.object3D.visible = false;
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
