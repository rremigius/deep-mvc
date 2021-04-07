import {Camera} from "three";
import {alphanumeric} from "validation-kit";
import ICameraView, {ICameraViewSymbol} from "@/Engine/views/common/IObjectView/ICameraView";
import {injectable} from "@/Engine/views/dependencies";
import threeViewDependencies from "@/Engine/views/threejs/dependencies";
import ThreeObject from "@/Engine/views/threejs/ThreeObject";

/**
 * For use in specific cases where PerspectiveCamera does not work (e.g. ThreeAREngine distorts using PerspectiveCamera)
 */
@injectable(threeViewDependencies, ICameraViewSymbol)
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
