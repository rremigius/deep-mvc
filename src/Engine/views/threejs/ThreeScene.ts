import {BoxGeometry, Mesh, MeshBasicMaterial, Scene} from "three";
import ISceneView, {ISceneViewSymbol} from "@/Engine/views/common/ISceneView";
import ThreeView from "@/Engine/views/threejs/ThreeView";

export default class ThreeScene extends ThreeView implements ISceneView {
	static ViewInterface = ISceneViewSymbol;

	protected createObject3D():Scene {
		const scene = new Scene();
		// Create the Geometry passing the size
		const geometry = new BoxGeometry( 1, 1, 1 );
		// Create the Material passing the color
		const material = new MeshBasicMaterial( { color: "#433F81" } );
		// Create the Mesh
		const cube = new Mesh( geometry, material );// Add the mesh to the scene
		scene.add( cube );

		return scene;
	}
	public getObject3D():Scene {
		return <Scene>super.getObject3D();
	}
}
