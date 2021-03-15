import Controller, {injectable} from "@/Controller";
import BehaviourModel from "@/models/BehaviourModel";
import TriggerController from "@/Controller/TriggerController";
import ControllerList from "@/Controller/ControllerList";

@injectable()
export default class BehaviourController extends Controller {
	static ModelClass = BehaviourModel;

	triggers!:ControllerList<TriggerController>;

	get xrBehaviour() {
		return <BehaviourModel>this.model;
	}

	init(xrObject:BehaviourModel) {
		super.init(xrObject);

		// Create triggers
		this.triggers = this.createControllerList(this.xrBehaviour.triggers, TriggerController);
		this.triggers.each(trigger => trigger.setDefaultController(this));
	}
}
