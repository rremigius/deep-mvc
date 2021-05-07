import EngineModel from "@/Engine/models/EngineModel";
import Controller, {controller, ControllerActions, ControllerEvents} from "@/Controller";
import {schema} from "mozel";
import SceneController from "@/Engine/controllers/ViewController/SceneController";
import ControllerSlot from "@/Controller/ControllerSlot";
import CameraController from "@/Engine/controllers/ViewController/ObjectController/CameraController";
import Engine from "@/Engine/Engine";

export class EnginePauseAction {
	constructor() {}
}

export class EngineEvents extends ControllerEvents {

}
export class EngineActions extends ControllerActions {
	pause = this.$action(EnginePauseAction);
}

/**
 * The Engine itself should not be an active part of its own rendering hierarchy, but we can add an EngineController that allows
 * other Controllers to contact the Engine.
 */
export default class EngineController extends Controller {
	static ModelClass = EngineModel;
	model!:EngineModel;

	_engine?:Engine;
	get engine() {
		return this._engine;
	}

	events = new EngineEvents();
	actions = new EngineActions();

	@controller(schema(EngineModel).scene, SceneController)
	scene!:ControllerSlot<SceneController>;

	@controller(schema(EngineModel).camera, CameraController)
	camera!:ControllerSlot<CameraController>;

	setEngine(engine:Engine) {
		this._engine = engine;
	}
}
