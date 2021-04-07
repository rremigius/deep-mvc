import {OrbitControls} from "three-orbitcontrols-ts";
import Engine from "@/Engine/Engine";
import ThreeCamera from "@/Engine/views/threejs/ThreeObject/ThreeCamera";
import ThreeViewFactory from "@/Engine/views/threejs/ThreeViewFactory";

export default class PlainEngine extends Engine {
	createDefaultViewFactory() {
		return new ThreeViewFactory();
	}

	init() {
		const camera = this.camera;
		if (!(camera instanceof ThreeCamera)) {
			throw new Error(`Camera is not a ThreeCamera`);
		}

		// Add Orbitcontrols to camera
		const controls = new OrbitControls(camera.getObject3D());
		controls.autoRotate = true;
		controls.enableDamping = true;
		controls.dampingFactor = 0.1;
		controls.rotateSpeed = 0.25;
		controls.minDistance = camera.getPosition().z / 2;
		controls.maxDistance = camera.getPosition().z * 2;
		controls.enableZoom = true;
		controls.maxPolarAngle = 1.57;

		return;
	}
}
