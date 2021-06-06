import {GenericMozel, MozelFactory} from "mozel";
import EngineModel from "./EngineModel";
import SceneModel from "./SceneModel";
import ObjectModel from "./ObjectModel";
import ViewModel from "@/View/ViewModel";
import BehaviourModel from "./BehaviourModel";
import TriggerModel from "./TriggerModel";
import CameraModel from "./ObjectModel/CameraModel";
import ImageModel from "./ObjectModel/ImageModel";
import GraphModel from "./ObjectModel/GraphModel";
import VideoModel from "./ObjectModel/VideoModel";
import TweenBehaviourModel from "./BehaviourModel/TweenBehaviourModel";
import SoundBehaviourModel from "./BehaviourModel/SoundBehaviourModel";
import Model3DModel from "./ObjectModel/Model3DModel";
import LightModel from "@examples/game-engine/models/ObjectModel/LightModel";
import OrbitControlsModel from "@examples/game-engine/models/ObjectModel/CameraModel/OrbitControlsModel";

export default class EngineModelFactory extends MozelFactory {
	initDependencies() {
		super.initDependencies();
		this.register([
			EngineModel, ViewModel, SceneModel, CameraModel, Model3DModel, ImageModel, GraphModel, VideoModel,
			BehaviourModel, TweenBehaviourModel, SoundBehaviourModel, TriggerModel, ObjectModel, LightModel,
			OrbitControlsModel, GenericMozel
		]);
	}
}
