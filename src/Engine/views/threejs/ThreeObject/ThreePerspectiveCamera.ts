import {PerspectiveCamera} from "three";
import ICameraView, {ICameraViewSymbol} from "@/Engine/views/common/IObjectView/ICameraView";
import ThreeObject from "../ThreeObject";

export default class ThreePerspectiveCamera extends ThreeObject implements ICameraView {
	static ViewInterface = ICameraViewSymbol;

	createObject3D() {
		return new PerspectiveCamera();
	}
	getObject3D():PerspectiveCamera {
		return <PerspectiveCamera>super.getObject3D();
	}

	public setAspectRatio(ratio: number): void {
		this.getObject3D().aspect = ratio;
		this.getObject3D().updateProjectionMatrix();
	}
}
