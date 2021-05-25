import ThreeObject from "@/Engine/views/threejs/ThreeObject";
import CameraModel from "@/Engine/models/ObjectModel/CameraModel";
import {Camera} from "three";
import {alphanumeric, schema} from "mozel";
import {ViewClickEvent} from "@/View";
import {ThreeViewRoot} from "@/Engine/views/threejs/ThreeView";
import {component} from "@/Component";
import ThreeOrbitControls from "@/Engine/views/threejs/ThreeObject/ThreeCamera/ThreeOrbitControls";
import ComponentSlot from "@/Component/ComponentSlot";

export class RootCamera extends Camera implements ThreeViewRoot {
	public gid: alphanumeric = 0;
	onClick(event:ViewClickEvent){};
}

const cameraSchema = schema(CameraModel);
export default class ThreeCamera extends ThreeObject {
	static ModelClass = CameraModel;
	model!:CameraModel;

	@component(cameraSchema.controls, ThreeOrbitControls)
	controls!:ComponentSlot<ThreeOrbitControls>

	get camera() { return <Camera><unknown>this.object3D; }
	createObject3D(): RootCamera {
		return new RootCamera();
	}

	public setAspectRatio(ratio: number): void {
		// this camera does not do that
	}
}
