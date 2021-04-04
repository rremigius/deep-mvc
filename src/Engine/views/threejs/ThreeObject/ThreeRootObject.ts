import ThreeObject from "@/Engine/views/threejs/ThreeObject";
import {Object3D} from "three";
import {alphanumeric} from "mozel";
import {injectable} from "@/Engine/views/dependencies";
import threeContainer from "@/Engine/views/threejs/dependencies";
import IViewRoot, {IViewRootSymbol, ViewClickEvent, ViewClickEventEmitter} from "@/IViewRoot";

export class RootObject3D extends Object3D {
	public gid: alphanumeric = 0;
	onClick(event:ViewClickEvent){};
}

@injectable(threeContainer, IViewRootSymbol)
export default class ThreeRootObject extends ThreeObject implements IViewRoot {
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
		const interactable = new RootObject3D();
		interactable.onClick = event => this.events.click.fire(event); // to be called by ThreeInteractionManager
		return interactable;
	}
}
