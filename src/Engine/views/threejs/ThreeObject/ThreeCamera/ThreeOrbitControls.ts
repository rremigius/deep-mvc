import ThreeCamera from "../ThreeCamera";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import OrbitControlsModel from "@/Engine/models/ObjectModel/CameraModel/OrbitControlsModel";
import Component from "@/Component";
import ThreeEngineView from "@/Engine/views/threejs/ThreeEngineView";
import Log from "@/log";
import {immediate, schema} from "mozel";

const log = Log.instance("view/three/camera/orbit-controls");

export default class ThreeOrbitControls extends Component {
	static Model = OrbitControlsModel;
	model!:OrbitControlsModel;

	controls?:OrbitControls;

	onInit() {
		super.onInit();

		const s = schema(OrbitControlsModel);
		this.model.$watch(s.rotateSpeed, speed => this.setRotateSpeed(speed), {immediate});
		this.model.$watch(s.maxPolarAngle, angle => this.setMaxPolarAngle(angle), {immediate});
		this.model.$watch(s.minDistance, distance => this.setMinDistance(distance), {immediate});
		this.model.$watch(s.maxDistance, distance => this.setMaxDistance(distance), {immediate});
		this.model.$watch(s.enableZoom, zoom => this.setZoomEnabled(zoom), {immediate});
	}

	setParent(parent?:Component) {
		super.setParent(parent);
		if(!parent) {
			if(this.controls) this.controls.enabled = false;
			return;
		}

		if(!(parent instanceof ThreeCamera)) {
			throw new Error("OrbitControls only work on a ThreeCamera.");
		}
		(async () => {
			// We need to wait for the parent to initialize; setParent is called first time before initialization of parent
			await parent.loading.wait();
			if(!(parent === this.parent)) {
				log.info("Parent changed before OrbitControls were setup.");
				return;
			}
			this.setupOrbitControls(parent);
		})();
	}

	setupOrbitControls(camera: ThreeCamera) {
		if(this.controls) this.controls.dispose(); // Stop current one

		const engine = this.getRootComponent();
		if(!(engine instanceof ThreeEngineView)) {
			throw new Error("ThreeOrbitControls only work on ThreeEngineView");
		}

		this.controls = new OrbitControls(camera.camera, engine.renderer.domElement);
		this.applySettings(this.controls);
	}

	applySettings(to:OrbitControls) {
		to.enableZoom = this.model.enableZoom;
		to.rotateSpeed = this.model.rotateSpeed;
		to.minDistance = this.model.minDistance
		to.maxDistance = this.model.maxDistance;
		to.maxPolarAngle = this.model.maxPolarAngle;
		to.enabled = this.model.enabled;
	}

	setZoomEnabled(enableZoom: boolean): void {
		if(this.controls) this.controls.enableZoom = enableZoom;
	}

	setRotateSpeed(rotateSpeed: number): void {
		if(this.controls) this.controls.rotateSpeed = rotateSpeed;
	}

	setMinDistance(minDistance: number): void {
		if(this.controls) this.controls.minDistance = minDistance;
	}

	setMaxDistance(maxDistance: number): void {
		if(this.controls) this.controls.maxDistance = maxDistance;
	}

	setMaxPolarAngle(maxPolarAngle: number): void {
		if(this.controls) this.controls.maxPolarAngle = maxPolarAngle;
	}

	setEnabled(enabled:boolean) {
		if(this.controls) this.controls.enabled = enabled;
	}

	onEnable() {
		super.onEnable();
		this.setEnabled(true);
	}

	onDisable() {
		super.onDisable();
		this.setEnabled(false);
	}
}
