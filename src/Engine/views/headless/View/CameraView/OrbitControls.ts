import IOrbitControls from "@/Engine/views/common/IObjectView/ICameraView/IOrbitControls";
import CameraView from "../CameraView";
import OrbitControlsModel from "@/Engine/models/ObjectModel/CameraModel/OrbitControlsModel";

export default class OrbitControls implements IOrbitControls {
	setupOrbitControls(camera: CameraView, model: OrbitControlsModel, domElement: HTMLElement): void {
	}
}
