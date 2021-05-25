import ThreeObject from "@/Engine/views/threejs/ThreeObject";
import CameraModel from "@/Engine/models/ObjectModel/CameraModel";
import {Camera} from "three";
import {schema} from "mozel";
import {extendForRootObject3D} from "@/Engine/views/threejs/ThreeView";
import {component} from "@/Component";
import ThreeOrbitControls from "@/Engine/views/threejs/ThreeObject/ThreeCamera/ThreeOrbitControls";
import ComponentSlot from "@/Component/ComponentSlot";

const RootCamera = extendForRootObject3D(Camera);

const cameraSchema = schema(CameraModel);
export default class ThreeCamera extends ThreeObject {
	static Model = CameraModel;
	model!:CameraModel;

	@component(cameraSchema.controls, ThreeOrbitControls)
	controls!:ComponentSlot<ThreeOrbitControls>

	get camera() { return <Camera><unknown>this.object3D; }
	createObject3D() {
		return new RootCamera();
	}

	public setAspectRatio(ratio: number): void {
		// this camera does not do that
	}
}
