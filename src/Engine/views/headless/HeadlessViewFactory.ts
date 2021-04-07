import ViewFactory from "../ViewFactory";
import Renderer from "./Renderer";
import View from "./View";
import ViewRoot from "./ViewRoot";
import SceneView from "./SceneView";
import CameraView from "./View/CameraView";
import GraphView from "./View/GraphView";
import ImageView from "./View/ImageView";
import LightView from "./View/LightView";
import Model3DView from "./View/Model3DView";
import VideoView from "./View/VideoView";
import {IOrbitControlsSymbol} from "@/Engine/views/common/IObjectView/ICameraView/IOrbitControls";
import OrbitControls from "@/Engine/views/headless/View/CameraView/OrbitControls";

export default class HeadlessViewFactory extends ViewFactory {
	initDependencies() {
		super.initDependencies();
		this.registerRenderer(Renderer);
		this.register([
			View, ViewRoot, SceneView, CameraView, GraphView, ImageView, LightView, Model3DView, VideoView
		]);
		this.bind(IOrbitControlsSymbol, OrbitControls);
	}
}
