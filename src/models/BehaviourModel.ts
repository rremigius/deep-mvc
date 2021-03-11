import {collection, Collection} from 'mozel';
import ControllerModel from "@/models/ControllerModel";
import TriggerModel from "@/models/TriggerModel";

export default class BehaviourModel extends ControllerModel {
	static get type() { return 'Behaviour' };

	@collection(TriggerModel)
	triggers!:Collection<TriggerModel<any,any>>;

	getObject() {
		return this.$parent;
	}
}
