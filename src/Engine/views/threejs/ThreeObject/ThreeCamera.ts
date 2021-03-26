import {Camera} from "three";
import {alphanumeric} from "validation-kit";
import ThreeObject from "@/Engine/views/threejs/ThreeObject";
import ICameraView from "@/Engine/views/common/IObjectView/ICameraView";

/**
 * For use in specific cases where PerspectiveCamera does not work (e.g. ThreeAREngine distorts using PerspectiveCamera)
 */
export default class ThreeCamera extends ThreeObject implements ICameraView {
	public gid: alphanumeric = "_CAMERA";

	protected createObject3D() {
		return new Camera();
	}
	public getObject3D(): Camera {
		return <Camera>super.getObject3D();
	}

	public setAspectRatio(ratio: number): void {
		// this camera does not do that
	}
}
