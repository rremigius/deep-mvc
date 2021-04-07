import IOrbitControls from "@/Engine/views/common/IObjectView/ICameraView/IOrbitControls";
import ThreeCamera from "../ThreeCamera";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import OrbitControlsModel from "@/Engine/models/ObjectModel/CameraModel/OrbitControlsModel";

export default class ThreeOrbitControls implements IOrbitControls {
	setupOrbitControls(camera: ThreeCamera, model:OrbitControlsModel, domElement:HTMLElement) {
		const controls = new OrbitControls(camera.getObject3D(), domElement);

		if(model.rotateSpeed !== undefined) controls.rotateSpeed = model.rotateSpeed;
		if(model.minDistance !== undefined) controls.minDistance = model.minDistance;
		if(model.maxDistance !== undefined) controls.maxDistance = model.maxDistance;
		if(model.enableZoom !== undefined) controls.enableZoom = model.enableZoom;
		if(model.maxPolarAngle !== undefined) controls.maxPolarAngle = model.maxPolarAngle;
	}
}
