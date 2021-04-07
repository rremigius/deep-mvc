import {collection, Collection} from 'mozel';
import BehaviourModel from './BehaviourModel';
import TriggerModel, {UnknownTriggerModel} from "@/Engine/models/TriggerModel";
import ViewModel from "@/ViewModel";

export default class ObjectModel extends ViewModel {
	static get type() { return 'Object'	};

	@collection(BehaviourModel)
	behaviours!:Collection<BehaviourModel>;

	@collection(TriggerModel)
	triggers!:Collection<UnknownTriggerModel>;
}
