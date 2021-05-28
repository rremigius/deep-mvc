import EngineModel from "@/Engine/models/EngineModel";
import Component, {component, ComponentAction, ComponentActions, ComponentEvents} from "@/Component";
import Engine from "@/Engine/Engine";
import {schema} from "mozel";
import SceneController from "@/Engine/controllers/SceneController";
import ComponentSlot from "@/Component/ComponentSlot";

export class EnginePauseAction extends ComponentAction<{}> {
}
export class EngineDestroyAction extends ComponentAction<{}> {
}

export class EngineEvents extends ComponentEvents {

}
export class EngineActions extends ComponentActions {
	pause = this.$action(EnginePauseAction);
	destroy = this.$action(EngineDestroyAction);
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

	events!:EngineEvents;
	actions!:EngineActions;

	onSetupEventsAndActions() {
		super.onSetupEventsAndActions();
		this.events = new EngineEvents();
		this.actions = new EngineActions();
	}

	onBindActions() {
		super.onBindActions();
		this.actions.pause.on(() => {
			if(!this.engine) return;
			this.engine.pause();
		});
		this.actions.destroy.on(() => {
			if(!this.engine) return;
			this.engine.destroy();
		});
	}

	setEngine(engine:Engine) {
		this._engine = engine;
	}
}
