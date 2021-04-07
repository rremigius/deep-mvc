import {Camera} from "three";
import ICameraView, {ICameraViewSymbol} from "@/Engine/views/common/IObjectView/ICameraView";
import ThreeViewRoot from "@/Engine/views/threejs/ThreeViewRoot";

export default class ThreeCamera extends ThreeViewRoot implements ICameraView {
	static ViewInterface = ICameraViewSymbol;

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
