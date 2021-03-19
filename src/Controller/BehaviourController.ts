import Controller, {injectable} from "@/Controller";
import BehaviourModel from "@/models/BehaviourModel";
import TriggerController from "@/Controller/TriggerController";
import ControllerList from "@/Controller/ControllerList";

@injectable()
export default class BehaviourController extends Controller {
	static ModelClass:typeof BehaviourModel = BehaviourModel;
	model!:BehaviourModel;

	triggers!:ControllerList<TriggerController>;

	init(model: BehaviourModel) {
		super.init(model);
		this.triggers = this.controllers(this.model.$('triggers'), TriggerController);
		this.triggers.events.added.on(event => event.controller.setDefaultController(this));
		this.triggers.events.removed.on(event => event.controller.setDefaultController(undefined));
	}
}
