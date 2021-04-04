import {Scene} from "three";
import ISceneView, {ISceneViewSymbol} from "@/Engine/views/common/ISceneView";
import {injectable} from "@/Engine/views/dependencies";
import threeContainer from "@/Engine/views/threejs/dependencies";
import ThreeObject from "@/Engine/views/threejs/ThreeObject";
import {alphanumeric} from "mozel";

@injectable(threeContainer, ISceneViewSymbol)
export default class ThreeScene extends ThreeObject implements ISceneView {
	public gid: alphanumeric = "_SCENE"; // Will be overwritten by ObjectController

	protected createObject3D():Scene {
		return new Scene();
	}
	public getObject3D():Scene {
		return <Scene>super.getObject3D();
	}
}
