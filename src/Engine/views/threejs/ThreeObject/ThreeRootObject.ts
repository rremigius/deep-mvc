import ThreeObject from "@/Engine/views/threejs/ThreeObject";
import {Object3D} from "three";
import {alphanumeric} from "mozel";
import IRootObjectView, {
	ObjectClickEvent,
	ObjectClickEventEmitter
} from "@/Engine/views/common/IObjectView/IRootObjectView";
import {injectable} from "@/Engine/views/dependencies";
import threeContainer from "@/Engine/views/threejs/dependencies";

export class RootObject3D extends Object3D {
	public gid: alphanumeric = 0;
	onClick(event:ObjectClickEvent){};
}

@injectable(threeContainer, "IRootObjectView")
export default class ThreeRootObject extends ThreeObject implements IRootObjectView {
	events = {
		click: new ObjectClickEventEmitter()
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
