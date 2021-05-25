import ThreeView from "./ThreeView";
import ThreeScene from "./ThreeScene";
import ThreeGraph from "./ThreeObject/ThreeGraph";
import ThreeLight from "./ThreeObject/ThreeLight";
import ThreePerspectiveCamera from "./ThreeObject/ThreePerspectiveCamera";
import ThreeVideo from "./ThreeObject/ThreeVideo";
import ViewFactory from "@/View/ViewFactory";
import ThreeModel3D from "@/Engine/views/threejs/ThreeObject/ThreeModel3D";
import ThreeEngineView from "@/Engine/views/threejs/ThreeEngineView";
import ThreeOrbitControls from "@/Engine/views/threejs/ThreeObject/ThreeCamera/ThreeOrbitControls";
import View from "@/View";

export default class ThreeViewFactory extends ViewFactory {
	initDependencies() {
		super.initDependencies();
		this.register([
			ThreeEngineView, ThreeView, ThreeScene, ThreeGraph, ThreeLight, ThreeModel3D, ThreePerspectiveCamera, ThreeVideo,
			ThreeOrbitControls
		]);
		this.registerDefault(View, ThreeView);
	}
}
