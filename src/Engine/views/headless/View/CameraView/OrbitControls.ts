import IOrbitControls from "@/Engine/views/common/IObjectView/ICameraView/IOrbitControls";
import CameraView from "../CameraView";

export default class OrbitControls implements IOrbitControls {
	setupOrbitControls(camera: CameraView, domElement: HTMLElement): void {
	}

	setMaxDistance(maxDistance: number): void {
	}

	setMaxPolarAngle(maxPolarAngle: number): void {
	}

	setMinDistance(minDistance: number): void {
	}

	setRotateSpeed(rotateSpeed: number): void {
	}

	setZoomEnabled(enableZoom: boolean): void {
	}
}
