import {BoxGeometry, Mesh, MeshBasicMaterial, Scene} from "three";
import ISceneView, {ISceneViewSymbol} from "@/Engine/views/common/ISceneView";
import ThreeView from "@/Engine/views/threejs/ThreeView";
import ThreeViewRoot from "@/Engine/views/threejs/ThreeViewRoot";

export default class ThreeScene extends ThreeViewRoot implements ISceneView {
	static ViewInterface = ISceneViewSymbol;

	protected createObject3D():Scene {
		return new Scene();
	}
	public getObject3D():Scene {
		return <Scene>super.getObject3D();
	}
}
