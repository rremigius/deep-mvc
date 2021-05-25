import EngineController from "./EngineController";
import ControllerFactory from "@/Controller/ControllerFactory";
import SceneController from "./ViewController/SceneController";
import Model3DController from "./ViewController/ObjectController/Model3DController";
import ImageController from "./ViewController/ObjectController/ImageController";
import GraphController from "./ViewController/ObjectController/GraphController";
import VideoController from "./ViewController/ObjectController/VideoController";
import TweenBehaviourController from "./BehaviourController/TweenBehaviourController";
import SoundBehaviourController from "./BehaviourController/SoundBehaviourController";
import BehaviourController from "./BehaviourController";
import TriggerController from "./TriggerController";
import ObjectController from "./ViewController/ObjectController";

export default class EngineControllerFactory extends ControllerFactory {
	initDependencies() {
		super.initDependencies();
		this.register([
			EngineController, SceneController, Model3DController, ImageController,
			GraphController, VideoController, BehaviourController, TweenBehaviourController, SoundBehaviourController,
			TriggerController, ObjectController
		])
	}
}
