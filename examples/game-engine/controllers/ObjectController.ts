import Component, {ComponentEvent, ComponentEvents, components} from "@/Component";
import ObjectModel from "@examples/game-engine/models/ObjectModel";
import TriggerController from "@examples/game-engine/controllers/TriggerController";
import BehaviourController from "@examples/game-engine/controllers/BehaviourController";
import ComponentList from "@/Component/ComponentList";
import {schema} from "mozel";
import Vector3Model from "@examples/game-engine/models/Vector3Model";
import Vector3 from "@examples/game-engine/views/common/Vector3";
import Log from "@/log";
import {ViewClickEvent} from "../../../src/View";

const log = Log.instance("object-controller");

export class ClickEvent extends ComponentEvent<{}>{}
export class SelectEvent extends ComponentEvent<{}>{}
export class DeselectEvent extends ComponentEvent<{}>{}
export class ObjectControllerEvents extends ComponentEvents {
	click = this.$event(ClickEvent);
	select = this.$event(SelectEvent);
	deselect = this.$event(DeselectEvent);
}

export default class ObjectController extends Component {
	static Model = ObjectModel;
	model!:ObjectModel;

	static Events = ObjectControllerEvents;
	events!:ObjectControllerEvents;

	@components(schema(ObjectController.Model).behaviours, BehaviourController)
	behaviours!:ComponentList<BehaviourController>;

	@components(schema(ObjectController.Model).triggers, TriggerController)
	triggers!:ComponentList<TriggerController>;

	onInit() {
		super.onInit();

		this.triggers.events.add.on(event => event.component.setDefaultController(this));
		this.triggers.events.remove.on(event => event.component.setDefaultController(undefined));

		this.watch(schema(ObjectController.Model).selected, selected => {
			selected ? this.onSelected() : this.onDeselected();
		});
	}

	setPosition(position:Vector3) {
		this.model.position = this.model.$create(Vector3Model, position);
	}

	select(state:boolean = true) {
		this.model.selected = state;
	}

	click() {
		log.info(`${this} clicked.`);
		this.select();
		this.events.click.fire(new ClickEvent(this));
	}

	onSelected() {
		log.info(`${this} selected.`);
		this.events.select.fire(new SelectEvent(this));
		this.eventBus.$fire(new SelectEvent(this));
	}
	onDeselected() {
		log.info(`${this} deselected.`);
		this.events.deselect.fire(new DeselectEvent(this));
		this.eventBus.$fire(new DeselectEvent(this));
	}
}
