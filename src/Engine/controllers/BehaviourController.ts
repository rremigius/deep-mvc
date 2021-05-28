import Component, {components} from "@/Component";
import BehaviourModel from "@/Engine/models/BehaviourModel";
import TriggerController from "@/Engine/controllers/TriggerController";
import ComponentList from "@/Component/ComponentList";
import {schema} from "mozel";

export default class BehaviourController extends Component {
	static Model = BehaviourModel;
	model!:BehaviourModel;

	@components(schema(BehaviourModel).triggers, TriggerController)
	triggers!:ComponentList<TriggerController>;

	onInit() {
		super.onInit();
		this.triggers.events.added.on(event => event.component.setDefaultController(this));
		this.triggers.events.removed.on(event => event.component.setDefaultController(undefined));
	}
}
