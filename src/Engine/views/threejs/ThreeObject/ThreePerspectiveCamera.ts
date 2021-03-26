import {PerspectiveCamera} from "three";
import ICameraView from "@/Engine/views/common/IObjectView/ICameraView";
import {injectable} from "@/Engine/views/dependencies";
import container from '../dependencies';
import ThreeCamera from "@/Engine/views/threejs/ThreeObject/ThreeCamera";
import {alphanumeric} from "mozel";

@injectable(container, "ICameraView")
export default class ThreePerspectiveCamera extends ThreeCamera implements ICameraView {
	public gid: alphanumeric = "_CAMERA";

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
