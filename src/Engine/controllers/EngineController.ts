import EngineModel from "@/Engine/models/EngineModel";
import Component, {component, ComponentActions, ComponentEvents} from "@/Component";
import Engine from "@/Engine/Engine";
import {schema} from "mozel";
import SceneController from "@/Engine/controllers/SceneController";
import ComponentSlot from "@/Component/ComponentSlot";

export class EnginePauseAction {
	constructor() {}
}

export class EngineEvents extends ComponentEvents {

}
export class EngineActions extends ComponentActions {
	pause = this.$action(EnginePauseAction);
}

export default class EngineController extends Component {
	static Model = EngineModel;
	model!:EngineModel;

	@component(schema(EngineModel).scene, SceneController)
	sceneController!:ComponentSlot<SceneController>;

	_engine?:Engine;
	get engine() {
		return this._engine;
	}

	events = new EngineEvents();
	actions = new EngineActions();

	setEngine(engine:Engine) {
		this._engine = engine;
	}
}
