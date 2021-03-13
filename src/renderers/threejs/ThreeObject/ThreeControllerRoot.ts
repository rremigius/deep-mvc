import ControllerRootRenderInterface, {ClickEventInterface} from "@/renderers/common/ObjectRenderInterface/ControllerRootRenderInterface";
import ThreeObject from "@/renderers/threejs/ThreeObject";
import {alphanumeric} from "@common/classes/Model/Property";
import {Object3D} from "three";
import {injectableObjectRender} from "@/renderers/inversify";
import threeContainer from "@/renderers/threejs/inversify";

export class RootObject3D extends Object3D {
	public gid: alphanumeric = 0;
	onClick(event:ClickEventInterface){};
}

@injectableObjectRender(threeContainer, "RootObjectRenderInterface")
export default class ThreeControllerRoot extends ThreeObject implements ControllerRootRenderInterface<RootObject3D> {
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
