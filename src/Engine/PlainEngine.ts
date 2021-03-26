import Engine from "@/Engine";
import {OrbitControls} from "three-orbitcontrols-ts";
import ThreeCamera from "../views/threejs/ThreeObject/ThreeCamera";
import Err from "@utils/error";

export default class PlainEngine extends Engine {
	createCamera() {
		let camera = super.createCamera();

		if (!(camera instanceof ThreeCamera)) {
			throw new Err({
				message: `Camera is not a ThreeCamera`
			});
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
