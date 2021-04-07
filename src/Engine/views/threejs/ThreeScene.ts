import {Scene} from "three";
import ISceneView from "@/Engine/views/common/ISceneView";
import ThreeView from "@/Engine/views/threejs/ThreeView";
import {alphanumeric} from "mozel";

export default class ThreeScene extends ThreeView implements ISceneView {
	public gid: alphanumeric = "_SCENE"; // Will be overwritten by ObjectController

	protected createObject3D():Scene {
		return new Scene();
	}
	public getObject3D():Scene {
		return <Scene>super.getObject3D();
	}
}
