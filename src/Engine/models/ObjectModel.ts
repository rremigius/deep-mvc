import {collection, Collection, property, required} from 'mozel';
import BehaviourModel from './BehaviourModel';

import Vector3Model from "@/Engine/models/Vector3Model";
import TriggerModel, {UnknownTriggerModel} from "@/Engine/models/TriggerModel";
import ControllerModel from "@/ControllerModel";
import ViewModel from "@/ViewModel";

export default class ObjectModel extends ViewModel {
	static get type() { return 'Object'	};

	@collection(BehaviourModel)
	behaviours!:Collection<BehaviourModel>;

	@collection(TriggerModel)
	triggers!:Collection<UnknownTriggerModel>;
}
