import {components} from "@/Component";
import ObjectModel from "@examples/GameEngine/models/ObjectModel";
import TriggerController from "@examples/GameEngine/controllers/TriggerController";
import BehaviourController from "@examples/GameEngine/controllers/BehaviourController";
import ComponentList from "@/Component/ComponentList";
import {schema} from "mozel";
import ViewController from "@/Controller/ViewController";
import Vector3Model from "@examples/GameEngine/models/Vector3Model";
import Vector3 from "@examples/GameEngine/views/common/Vector3";

export default class ObjectController extends ViewController {
	static Model = ObjectModel;
	model!:ObjectModel;

	@components(schema(ObjectModel).behaviours, BehaviourController)
	behaviours!:ComponentList<BehaviourController>;

	@components(schema(ObjectModel).triggers, TriggerController)
	triggers!:ComponentList<TriggerController>;

	onInit() {
		super.onInit();

		this.triggers.events.added.on(event => event.component.setDefaultController(this));
		this.triggers.events.removed.on(event => event.component.setDefaultController(undefined));
	}

	setPosition(position:Vector3) {
		this.model.position = this.model.$create(Vector3Model, position);
	}
}
