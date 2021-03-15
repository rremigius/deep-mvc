import ThreeObject from "@/renderers/threejs/ThreeObject";
import {Object3D} from "three";
import {alphanumeric} from "mozel";
import RootObjectRenderInterface, {
	ObjectClickEvent,
	ObjectClickEventEmitter
} from "@/renderers/common/ObjectRenderInterface/RootObjectRenderInterface";
import {injectable} from "@/renderers/inversify";
import threeContainer from "@/renderers/threejs/inversify";

export class RootObject3D extends Object3D {
	public gid: alphanumeric = 0;
	onClick(event:ObjectClickEvent){};
}

@injectable(threeContainer, "RootObjectRenderInterface")
export default class ThreeRootObject extends ThreeObject implements RootObjectRenderInterface {
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
