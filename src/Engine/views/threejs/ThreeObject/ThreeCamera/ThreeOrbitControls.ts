import IOrbitControls from "@/Engine/views/common/IObjectView/ICameraView/IOrbitControls";
import ThreeCamera from "../ThreeCamera";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import OrbitControlsModel, {OrbitControlSettings} from "@/Engine/models/ObjectModel/CameraModel/OrbitControlsModel";

type Settings = OrbitControlSettings & {enabled:boolean};

export default class ThreeOrbitControls implements IOrbitControls {
	controls?:OrbitControls;

	// We keep a settings object to track settings for when we don't have an OrbitControls, to be applied later
	// This is because we cannot instantiate an empty OrbitControls without proper camera and domElement.
	settings:Settings = {...OrbitControlsModel.defaults, enabled: false};

	setupOrbitControls(camera: ThreeCamera, domElement:HTMLElement) {
		if(this.controls) this.controls.dispose(); // Stop current one

		this.controls = new OrbitControls(camera.getObject3D(), domElement);
		this.applySettings(this.controls);
	}

	applySettings(to:OrbitControls) {
		to.enableZoom = this.settings.enableZoom;
		to.rotateSpeed = this.settings.rotateSpeed;
		to.minDistance = this.settings.minDistance
		to.maxDistance = this.settings.maxDistance;
		to.maxPolarAngle = this.settings.maxPolarAngle;
		to.enabled = this.settings.enabled;
	}

	setZoomEnabled(enableZoom: boolean): void {
		this.settings.enableZoom = enableZoom;
		if(this.controls) this.controls.enableZoom = enableZoom;
	}

	setRotateSpeed(rotateSpeed: number): void {
		this.settings.rotateSpeed = rotateSpeed;
		if(this.controls) this.controls.rotateSpeed = rotateSpeed;
	}

	setMinDistance(minDistance: number): void {
		this.settings.minDistance = minDistance;
		if(this.controls) this.controls.minDistance = minDistance;
	}

	setMaxDistance(maxDistance: number): void {
		this.settings.maxDistance = maxDistance;
		if(this.controls) this.controls.maxDistance = maxDistance;
	}

	setMaxPolarAngle(maxPolarAngle: number): void {
		this.settings.maxPolarAngle = maxPolarAngle;
		if(this.controls) this.controls.maxPolarAngle = maxPolarAngle;
	}

	enable(enabled: boolean) {
		this.settings.enabled = enabled;
		if(this.controls) this.controls.enabled = enabled;
	}
}
