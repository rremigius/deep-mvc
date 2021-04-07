import Engine from "@/Engine/Engine";
import ThreeCamera from "@/Engine/views/threejs/ThreeObject/ThreeCamera";
import ThreeViewFactory from "@/Engine/views/threejs/ThreeViewFactory";
import ThreeRenderer from "@/Engine/views/threejs/ThreeRenderer";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export default class PlainEngine extends Engine {
	createDefaultViewFactory() {
		return new ThreeViewFactory();
	}

	init() {
		const camera = this.camera;
		if (!(camera instanceof ThreeCamera)) {
			throw new Error(`Camera is not a ThreeCamera`);
		}

		if(!(this.renderer instanceof ThreeRenderer)) {
			throw new Error(`Renderer is not a ThreeRenderer`);
		}

		// Add Orbitcontrols to camera
		const controls = new OrbitControls(camera.getObject3D(), this.renderer.renderer.domElement);
		controls.rotateSpeed = 0.5;
		controls.minDistance = camera.getPosition().z / 3;
		controls.maxDistance = camera.getPosition().z * 3;
		controls.enableZoom = true;
		controls.maxPolarAngle = 1.57;

		return;
	}
}
