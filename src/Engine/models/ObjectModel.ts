import {collection, Collection, property, required} from 'mozel';
import BehaviourModel from './BehaviourModel';
import TriggerModel, {UnknownTriggerModel} from "@/Engine/models/TriggerModel";
import ViewModel from "@/ViewModel";
import Vector3Model from "@/Engine/models/Vector3Model";

export default class ObjectModel extends ViewModel {
	static get type() { return 'Object'	};

	@property(Number, {required, default: 1})
	scale!:number;

	@property(Vector3Model, {required})
	position!:Vector3Model;

	@collection(BehaviourModel)
	behaviours!:Collection<BehaviourModel>;

	@collection(TriggerModel)
	triggers!:Collection<UnknownTriggerModel>;
}
