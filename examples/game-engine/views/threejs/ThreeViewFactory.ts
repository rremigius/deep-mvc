import ThreeView from "./ThreeView";
import ThreeScene from "./ThreeScene";
import ThreeGraph from "./ThreeObject/ThreeGraph";
import ThreeLight from "./ThreeObject/ThreeLight";
import ThreePerspectiveCamera from "./ThreeObject/ThreePerspectiveCamera";
import ThreeVideo from "./ThreeObject/ThreeVideo";
import ViewFactory from "@/View/ViewFactory";
import ThreeModel3D from "@examples/game-engine/views/threejs/ThreeObject/ThreeModel3D";
import ThreeEngineView from "@examples/game-engine/views/threejs/ThreeEngineView";
import ThreeOrbitControls from "@examples/game-engine/views/threejs/ThreeObject/ThreeCamera/ThreeOrbitControls";
import View from "@/View";
import ThreeImage from "@examples/game-engine/views/threejs/ThreeObject/ThreeImage";

export default class ThreeViewFactory extends ViewFactory {
	initDependencies() {
		super.initDependencies();
		this.register([
			ThreeEngineView, ThreeView, ThreeScene, ThreeGraph, ThreeLight, ThreeModel3D, ThreeImage, ThreePerspectiveCamera,
			ThreeVideo, ThreeOrbitControls
		]);
		this.registerDefault(View, ThreeView);
	}
}
