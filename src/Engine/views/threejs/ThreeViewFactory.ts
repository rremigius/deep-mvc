import ViewFactory from "../ViewFactory";
import ThreeRenderer from "./ThreeRenderer";
import ThreeView from "./ThreeView";
import ThreeViewRoot from "./ThreeViewRoot";
import ThreeScene from "./ThreeScene";
import ThreeGraph from "./ThreeObject/ThreeGraph";
import ThreeLight from "./ThreeObject/ThreeLight";
import {ThreeModel3D} from "./ThreeObject/ThreeModel3D";
import ThreePerspectiveCamera from "./ThreeObject/ThreePerspectiveCamera";
import ThreeVideo from "./ThreeObject/ThreeVideo";

export default class ThreeViewFactory extends ViewFactory {
	initDependencies() {
		super.initDependencies();
		this.registerRenderer(ThreeRenderer);
		this.register([
			ThreeView, ThreeViewRoot, ThreeScene, ThreeGraph, ThreeLight, ThreeModel3D, ThreePerspectiveCamera, ThreeVideo
		]);
	}
}
