import EngineModel from "@/Engine/models/EngineModel";
import {component, ComponentAction, ComponentActions, ComponentEvent, components} from "@/Component";
import Engine from "@/Engine/Engine";
import {schema} from "mozel";
import SceneController from "@/Engine/controllers/SceneController";
import ComponentSlot from "@/Component/ComponentSlot";
import ObjectController from "@/Engine/controllers/ObjectController";
import ComponentList from "@/Component/ComponentList";
import ViewController, {DeselectEvent, SelectEvent, ViewControllerEvents} from "@/Controller/ViewController";
import Log from "@/log";

const log = Log.instance("engine-controller");

export class EnginePauseAction extends ComponentAction<{}> {}
export class EngineDestroyAction extends ComponentAction<{}> {}
export class SelectionEvent extends ComponentEvent<{selection:ObjectController[], oldSelection:ObjectController[]}> {}

export class EngineEvents extends ViewControllerEvents {
	selection = this.$event(SelectionEvent);
}
export class EngineActions extends ComponentActions {
	pause = this.$action(EnginePauseAction);
	destroy = this.$action(EngineDestroyAction);
}

export default class EngineController extends ViewController {
	static Model = EngineModel;
	model!:EngineModel;

	@component(schema(EngineModel).scene, SceneController)
	sceneController!:ComponentSlot<SceneController>;

	@components(schema(EngineModel).selection, ObjectController)
	selection!:ComponentList<ObjectController>;

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

	onInit() {
		super.onInit();
		this.eventBus.$on(SelectEvent, event => {
			if(event.origin instanceof ObjectController) {
				// Replaces other selections
				this.setSelection([event.origin]);
			}
		});
		this.eventBus.$on(DeselectEvent, event => {
			if(event.origin instanceof ObjectController) {
				this.selection.remove(event.origin);
			}
		});
	}

	setSelection(objects:ObjectController[]) {
		const oldSelection = this.selection.current;
		// Deselect others
		this.selection.each(object => object.select(false));

		// Select new
		for(let object of objects) {
			object.select(); // if already set to true, will not fire any changes
			this.selection.add(object);
		}

		const selection = this.selection.current;
		log.info(`Current selection: `, selection);
		this.events.selection.fire(new SelectionEvent(this, {selection, oldSelection}))
	}

	setEngine(engine:Engine) {
		this._engine = engine;
	}
}
