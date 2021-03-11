import XRControllerRootRenderInterface, {ClickEventInterface} from "@/classes/renderers/common/XRObjectRenderInterface/XRControllerRootRenderInterface";
import XRThreeObject from "@/classes/renderers/threejs/XRThreeObject";
import {alphanumeric} from "@common/classes/Model/Property";
import {Object3D} from "three";
import {injectableXRObjectRender} from "@/classes/renderers/inversify";
import threeContainer from "@/classes/renderers/threejs/inversify";

export class RootObject3D extends Object3D {
	public gid: alphanumeric = 0;
	onClick(event:ClickEventInterface){};
}

@injectableXRObjectRender(threeContainer, "XRRootObjectRenderInterface")
export default class ThreeControllerRoot extends XRThreeObject implements XRControllerRootRenderInterface<RootObject3D> {
	get onClick() {
		return this.getRenderObject().onClick;
	}
	set onClick(handler:(event: ClickEventInterface)=>void) {
		this.getRenderObject().onClick = handler;
	}

	get gid() {
		return this.getRenderObject().gid;
	}
	set gid(gid:alphanumeric) {
		this.getRenderObject().gid = gid;
	}

	protected createObject3D(): Object3D {
		return new RootObject3D();
	}
	getRenderObject():RootObject3D {
		return <RootObject3D>super.getRenderObject();
	}
}
