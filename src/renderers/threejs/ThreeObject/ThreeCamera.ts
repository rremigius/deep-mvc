import CameraRenderInterface from "@/renderers/common/ObjectRenderInterface/CameraRenderInterface";
import {Camera} from "three";
import ThreeObject from "@/renderers/threejs/ThreeObject";
import {alphanumeric} from "validation-kit";

/**
 * For use in specific cases where PerspectiveCamera does not work (e.g. ThreeAREngine distorts using PerspectiveCamera)
 */
export default class ThreeCamera extends ThreeObject implements CameraRenderInterface<Camera> {
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
