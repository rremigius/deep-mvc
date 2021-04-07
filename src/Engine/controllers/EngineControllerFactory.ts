import EngineController from "./ViewController/EngineController";
import ViewController from "../../Controller/ViewController";
import ControllerFactory from "@/Controller/ControllerFactory";
import SceneController from "./ViewController/SceneController";
import CameraController from "./ViewController/ObjectController/CameraController";
import Model3DController from "./ViewController/ObjectController/Model3DController";
import ImageController from "./ViewController/ObjectController/ImageController";
import GraphController from "./ViewController/ObjectController/GraphController";
import VideoController from "./ViewController/ObjectController/VideoController";
import TweenBehaviourController from "./BehaviourController/TweenBehaviourController";
import SoundBehaviourController from "./BehaviourController/SoundBehaviourController";
import BehaviourController from "./BehaviourController";
import TriggerController from "./TriggerController";
import ObjectController from "./ViewController/ObjectController";
import LightController from "@/Engine/controllers/ViewController/ObjectController/LightController";

export default class EngineControllerFactory extends ControllerFactory {
	initDependencies() {
		super.initDependencies();
		this.register([
			EngineController, ViewController, SceneController, CameraController, Model3DController, ImageController,
			GraphController, VideoController, BehaviourController, TweenBehaviourController, SoundBehaviourController,
			TriggerController, ObjectController, LightController
		])
	}
}
