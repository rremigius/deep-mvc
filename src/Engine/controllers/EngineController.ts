import EngineModel from "@/Engine/models/EngineModel";
import Component, {ComponentActions, ComponentEvents} from "@/Component";
import Engine from "@/Engine/Engine";

export class EnginePauseAction {
	constructor() {}
}

export class EngineEvents extends ComponentEvents {

}
export class EngineActions extends ComponentActions {
	pause = this.$action(EnginePauseAction);
}

/**
 * The Engine itself should not be an active part of its own rendering hierarchy, but we can add an EngineComponent that allows
 * other Components to contact the Engine.
 */
export default class EngineController extends Component {
	static ModelClass = EngineModel;
	model!:EngineModel;

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
