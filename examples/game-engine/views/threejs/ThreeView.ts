import View from "@/View";
import {Object3D} from "three";
import {alphanumeric} from "mozel";
import {ThreeClickEvent} from "@examples/game-engine/views/threejs/ThreeEngineView";
import {Constructor} from "validation-kit";

export interface ThreeViewRoot {
	gid: alphanumeric;
	onClick(event:ThreeClickEvent):void;
}

export function root<T extends Constructor<Object3D>>(Class:T) {
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

		// Remove from current parent
		if(this.parentObject3D) {
			this.parentObject3D.remove(this.object3D);
		}
		// Add to new parent
		if(parent) {
			this.parentObject3D = parent.object3D;
			if(this.parentObject3D) this.parentObject3D.add(this.object3D); // might not be initialized yet
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

	onEnable() {
		super.onEnable();
		if(this.parentObject3D) this.parentObject3D.add(this.object3D);
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
