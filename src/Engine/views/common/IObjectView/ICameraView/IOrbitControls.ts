import ICameraView from "../ICameraView";
import OrbitControlsModel from "../../../../models/ObjectModel/CameraModel/OrbitControlsModel";

export default interface IOrbitControls {
	setupOrbitControls(camera:ICameraView, model:OrbitControlsModel, domElement:HTMLElement):void;
}

export const IOrbitControlsSymbol = Symbol.for("IOrbitControls");
