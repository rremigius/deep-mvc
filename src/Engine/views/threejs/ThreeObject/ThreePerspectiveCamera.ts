import {PerspectiveCamera} from "three";
import ICameraView, {ICameraViewSymbol} from "@/Engine/views/common/IObjectView/ICameraView";
import {injectable} from "@/Engine/views/dependencies";
import threeViewDependencies from "../dependencies";
import ThreeObject from "../ThreeObject";

@injectable(threeViewDependencies, ICameraViewSymbol)
export default class ThreePerspectiveCamera extends ThreeObject implements ICameraView {
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
