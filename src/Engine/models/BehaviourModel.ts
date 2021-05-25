import {collection, Collection} from 'mozel';
import ComponentModel from "@/ComponentModel";
import TriggerModel from "@/Engine/models/TriggerModel";

export default class BehaviourModel extends ComponentModel {
	static get type() { return 'Behaviour' };

	@collection(TriggerModel)
	triggers!:Collection<TriggerModel<any,any>>;

	getObject() {
		return this.$parent;
	}
}
