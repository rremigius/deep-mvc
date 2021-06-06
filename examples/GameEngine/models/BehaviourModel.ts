import {collection, Collection} from 'mozel';
import TriggerModel from "@examples/GameEngine/models/TriggerModel";
import BaseComponentModel from "@examples/GameEngine/BaseComponentModel";

export default class BehaviourModel extends BaseComponentModel {
	static get type() { return 'Behaviour' };

	@collection(TriggerModel)
	triggers!:Collection<TriggerModel<any,any>>;

	getObject() {
		return this.$parent;
	}
}
