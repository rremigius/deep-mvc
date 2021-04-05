import {Scene} from "three";
import ISceneView, {ISceneViewSymbol} from "@/Engine/views/common/ISceneView";
import {injectable} from "@/Engine/views/dependencies";
import threeViewDependencies from "@/Engine/views/threejs/dependencies";
import ThreeView from "@/Engine/views/threejs/ThreeView";
import {alphanumeric} from "mozel";

@injectable(threeViewDependencies, ISceneViewSymbol)
export default class ThreeScene extends ThreeView implements ISceneView {
	public gid: alphanumeric = "_SCENE"; // Will be overwritten by ObjectController

	protected createObject3D():Scene {
		return new Scene();
	}
	public getObject3D():Scene {
		return <Scene>super.getObject3D();
	}
}
