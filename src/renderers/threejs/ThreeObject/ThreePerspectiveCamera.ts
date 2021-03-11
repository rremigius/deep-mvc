import {PerspectiveCamera} from "three";
import {alphanumeric} from "@common/classes/Model/Model";
import XRCameraRenderInterface from "@/classes/renderers/common/XRObjectRenderInterface/XRCameraRenderInterface";
import {injectableXRObjectRender} from "@/classes/renderers/inversify";
import container from '../inversify';
import XRThreeCamera from "@/classes/renderers/threejs/XRThreeObject/XRThreeCamera";

@injectableXRObjectRender(container, "XRCameraRenderInterface")
export default class ThreePerspectiveCamera extends XRThreeCamera implements XRCameraRenderInterface<PerspectiveCamera> {
	public gid: alphanumeric = "_CAMERA";

	createObject3D() {
		return new PerspectiveCamera();
	}
	getRenderObject():PerspectiveCamera {
		return <PerspectiveCamera>super.getRenderObject();
	}

	public setAspectRatio(ratio: number): void {
		this.getRenderObject().aspect = ratio;
		this.getRenderObject().updateProjectionMatrix();
	}
}
