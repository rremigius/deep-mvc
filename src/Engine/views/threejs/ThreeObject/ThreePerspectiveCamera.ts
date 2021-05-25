import ThreeCamera from "@/Engine/views/threejs/ThreeObject/ThreeCamera";
import {PerspectiveCamera} from "three";
import {ThreeViewRoot} from "@/Engine/views/threejs/ThreeView";
import {alphanumeric} from "mozel";
import {ViewClickEvent} from "@/View";

export class RootPerspectiveCamera extends PerspectiveCamera implements ThreeViewRoot {
	public gid: alphanumeric = 0;
	onClick(event:ViewClickEvent){};
}

export default class ThreePerspectiveCamera extends ThreeCamera {
	createObject3D(): RootPerspectiveCamera {
		return new RootPerspectiveCamera();
	}
}
