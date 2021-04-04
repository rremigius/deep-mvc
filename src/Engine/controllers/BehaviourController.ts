import Controller, {controllers, injectable} from "@/Controller";
import BehaviourModel from "@/Engine/models/BehaviourModel";
import TriggerController from "@/Engine/controllers/TriggerController";
import ControllerList from "@/Controller/ControllerList";
import {schema} from "mozel";

@injectable()
export default class BehaviourController extends Controller {
	static ModelClass:typeof BehaviourModel = BehaviourModel;
	model!:BehaviourModel;

	@controllers(schema(BehaviourModel).triggers, TriggerController)
	triggers!:ControllerList<TriggerController>;

	init(model: BehaviourModel) {
		super.init(model);
		this.triggers.events.added.on(event => event.controller.setDefaultController(this));
		this.triggers.events.removed.on(event => event.controller.setDefaultController(undefined));
	}
}
