import {components} from "@/Component";
import ComponentModel from "@/ComponentModel";
import ObjectModel from "@/Engine/models/ObjectModel";
import TriggerController from "@/Engine/controllers/TriggerController";
import BehaviourController from "@/Engine/controllers/BehaviourController";
import ComponentList from "@/Component/ComponentList";
import {schema} from "mozel";
import ViewController from "@/Controller/ViewController";

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
}
