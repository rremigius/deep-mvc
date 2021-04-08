import ICameraView from "../ICameraView";

export default interface IOrbitControls {
	setupOrbitControls(camera:ICameraView, domElement:HTMLElement):void;
	setRotateSpeed(rotateSpeed:number):void;
	setMinDistance(minDistance:number):void;
	setMaxDistance(maxDistance:number):void;
	setZoomEnabled(enableZoom:boolean):void;
	setMaxPolarAngle(maxPolarAngle:number):void;
}

export const IOrbitControlsSymbol = Symbol.for("IOrbitControls");
