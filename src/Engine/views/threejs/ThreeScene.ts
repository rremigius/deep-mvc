import {Scene} from "three";
import SceneModel from "@/Engine/models/SceneModel";
import ThreeView from "@/Engine/views/threejs/ThreeView";
import {alphanumeric} from "mozel";
import {ViewClickEvent} from "@/View";

class RootScene extends Scene {
	public gid: alphanumeric = 0;
	onClick(event:ViewClickEvent){};
}

export default class ThreeScene extends ThreeView {
	static Model = SceneModel;
	model!:SceneModel;

	createObject3D() {
		return new RootScene();
	}
}
