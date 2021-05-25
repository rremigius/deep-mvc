import {Scene} from "three";
import SceneModel from "@/Engine/models/SceneModel";
import ThreeView, {extendForRootObject3D} from "@/Engine/views/threejs/ThreeView";

const RootScene = extendForRootObject3D(Scene);
export default class ThreeScene extends ThreeView {
	static Model = SceneModel;
	model!:SceneModel;

	createObject3D() {
		return new RootScene();
	}
}
