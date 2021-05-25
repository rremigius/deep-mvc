import View, {ViewClickEvent} from "@/View";
import ComponentModel from "@/ComponentModel";
import {Object3D} from "three";
import Vector3, {SparseVector3} from "@/Engine/views/common/Vector3";
import {alphanumeric} from "mozel";

export interface ThreeViewRoot {
	gid: alphanumeric;
	onClick(event:ViewClickEvent):void;
}

export class RootObject3D extends Object3D {
	public gid: alphanumeric = 0;
	onClick(event:ViewClickEvent){};
}

export default class ThreeView extends View {
	private _object3D!:Object3D & ThreeViewRoot;
	get object3D() { return this._object3D };

	init(model: ComponentModel) {
		super.init(model);
		this._object3D = this.createObject3D();
	}

	createObject3D() {
		const root = new RootObject3D();
		root.onClick = this.click.bind(this); // To be called by ThreeEngineView
		return root;
	}

	click(event:ViewClickEvent) {
		this.onClick(event);
		this.events.click.fire(event);
	}

	onClick(event:ViewClickEvent) {
		// For override
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

	onSetScale(scale: Vector3 | SparseVector3) {
		super.onSetScale(scale);
		if(scale instanceof Vector3) {
			this.object3D.position.set(scale.x, scale.y, scale.z);
		} else {
			applySparseVector(this.object3D.scale, scale);
		}
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
