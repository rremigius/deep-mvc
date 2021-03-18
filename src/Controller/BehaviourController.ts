import Controller, {injectable} from "@/Controller";
import BehaviourModel from "@/models/BehaviourModel";
import TriggerController from "@/Controller/TriggerController";

@injectable()
export default class BehaviourController extends Controller {
	static ModelClass:typeof BehaviourModel = BehaviourModel;
	model!:BehaviourModel;

	triggers = this.controllers(this.model.$('triggers'), TriggerController).init(list => {
		list.each(trigger => trigger.setDefaultController(this));
	});
}
