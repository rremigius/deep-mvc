import {alphanumeric} from "@common/classes/Model/Model";
import XRCameraRenderInterface from "@/classes/renderers/common/XRObjectRenderInterface/XRCameraRenderInterface";
import {Camera} from "three";
import XRThreeObject from "@/classes/renderers/threejs/XRThreeObject";

/**
 * For use in specific cases where PerspectiveCamera does not work (e.g. ThreeAREngine distorts using PerspectiveCamera)
 */
export default class ThreeCamera extends XRThreeObject implements XRCameraRenderInterface<Camera> {
	public gid: alphanumeric = "_CAMERA";

	protected createObject3D() {
		return new Camera();
	}
	public getRenderObject(): Camera {
		return <Camera>super.getRenderObject();
	}

	public setAspectRatio(ratio: number): void {
		// this camera does not do that
	}
}
