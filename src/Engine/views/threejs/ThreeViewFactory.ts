import ThreeView from "./ThreeView";
import ThreeScene from "./ThreeScene";
import ThreeGraph from "./ThreeObject/ThreeGraph";
import ThreeLight from "./ThreeObject/ThreeLight";
import ThreePerspectiveCamera from "./ThreeObject/ThreePerspectiveCamera";
import ThreeVideo from "./ThreeObject/ThreeVideo";
import ViewFactory from "@/View/ViewFactory";
import {ThreeModel3D} from "@/Engine/views/threejs/ThreeObject/ThreeModel3D";

export default class ThreeViewFactory extends ViewFactory {
	initDependencies() {
		super.initDependencies();
		this.register([
			ThreeView, ThreeScene, ThreeGraph, ThreeLight, ThreeModel3D, ThreePerspectiveCamera, ThreeVideo
		]);
	}
}
