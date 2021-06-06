import {Scene} from "three";
import SceneModel from "@examples/GameEngine/models/SceneModel";
import ThreeView, {root} from "@examples/GameEngine/views/threejs/ThreeView";

const RootScene = root(Scene);
export default class ThreeScene extends ThreeView {
	static Model = SceneModel;
	model!:SceneModel;

	createObject3D() {
		return new RootScene();
	}
}
