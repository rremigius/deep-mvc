import {PerspectiveCamera} from "three";
import ICameraView, {ICameraViewSymbol} from "@/Engine/views/common/IObjectView/ICameraView";
import {injectable} from "@/Engine/views/dependencies";
import ThreeCamera from "@/Engine/views/threejs/ThreeView/ThreeCamera";
import threeViewDependencies from "../dependencies";

@injectable(threeViewDependencies, ICameraViewSymbol)
export default class ThreePerspectiveCamera extends ThreeCamera implements ICameraView {
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
