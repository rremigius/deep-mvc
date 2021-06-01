import {components} from "@/Component";
import ObjectModel from "@/Engine/models/ObjectModel";
import TriggerController from "@/Engine/controllers/TriggerController";
import BehaviourController from "@/Engine/controllers/BehaviourController";
import ComponentList from "@/Component/ComponentList";
import {schema} from "mozel";
import ViewController from "@/Controller/ViewController";
import Vector3Model from "@/Engine/models/Vector3Model";
import Vector3 from "@/Engine/views/common/Vector3";

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
