import Controller, {injectable} from "@/Controller";
import BehaviourModel from "@/models/BehaviourModel";
import TriggerController from "@/Controller/TriggerController";

@injectable()
export default class BehaviourController extends Controller {
	static ModelClass:typeof BehaviourModel = BehaviourModel;
	model!:BehaviourModel;

	init(xrObject:BehaviourModel) {
		super.init(xrObject);

		// Create triggers
		this.controllers(this.model.$p('triggers'), TriggerController, list => {
			list.each(trigger => trigger.setDefaultController(this));
		});
	}
}
