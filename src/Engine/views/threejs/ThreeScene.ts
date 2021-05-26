import {Scene} from "three";
import SceneModel from "@/Engine/models/SceneModel";
import ThreeView, {root} from "@/Engine/views/threejs/ThreeView";

const RootScene = root(Scene);
export default class ThreeScene extends ThreeView {
	static Model = SceneModel;
	model!:SceneModel;

	createObject3D() {
		return new RootScene();
	}
}
