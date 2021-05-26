import ThreeCamera from "@/Engine/views/threejs/ThreeObject/ThreeCamera";
import {PerspectiveCamera} from "three";
import {root} from "@/Engine/views/threejs/ThreeView";

const RootPerspectiveCamera = root(PerspectiveCamera);
export default class ThreePerspectiveCamera extends ThreeCamera {
	createObject3D() {
		return new RootPerspectiveCamera();
	}

	setAspectRatio(ratio: number) {
		super.setAspectRatio(ratio);
		const camera = <PerspectiveCamera>this.camera;
		camera.aspect = ratio;
		camera.updateProjectionMatrix();
	}
}
