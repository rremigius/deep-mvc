import {Camera} from "three";
import {alphanumeric} from "validation-kit";
import ICameraView, {ICameraViewSymbol} from "@/Engine/views/common/IObjectView/ICameraView";
import ThreeObject from "@/Engine/views/threejs/ThreeObject";

export default class ThreeCamera extends ThreeObject implements ICameraView {
	static ViewInterface = ICameraViewSymbol;

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
