import ThreeView from "@/Engine/views/threejs/ThreeView";
import {BoxGeometry, Mesh, MeshBasicMaterial, Object3D} from "three";
import {alphanumeric} from "mozel";
import IViewRoot, {IViewRootSymbol, ViewClickEvent, ViewClickEventEmitter} from "@/IViewRoot";

export class RootObject3D extends Object3D {
	public gid: alphanumeric = 0;
	onClick(event:ViewClickEvent){};
}

export default class ThreeViewRoot extends ThreeView implements IViewRoot {
	static ViewInterface = IViewRootSymbol;

	events = {
		click: new ViewClickEventEmitter()
	}

	get gid() {
		return this.getInteractableObject3D().gid;
	}
	set gid(gid:alphanumeric) {
		this.getInteractableObject3D().gid = gid;
	}

	getInteractableObject3D() {
		return this.getObject3D() as RootObject3D;
	}

	protected createObject3D(): Object3D {
		const root = new RootObject3D();
		root.onClick = event => this.events.click.fire(event); // to be called by ThreeInteractionManager
		return root;
	}
}
