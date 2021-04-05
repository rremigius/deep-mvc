import {OrbitControls} from "three-orbitcontrols-ts";
import EngineAbstract from "@/Engine/EngineAbstract";
import ThreeCamera from "@/Engine/views/threejs/ThreeObject/ThreeCamera";
import ThreeRenderer from "@/Engine/views/threejs/ThreeRenderer";

export default class PlainEngine extends EngineAbstract {
	createRenderer() {
		return new ThreeRenderer();
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

		return camera;
	}
}
