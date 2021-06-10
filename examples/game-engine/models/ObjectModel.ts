import {collection, Collection, property, required} from 'mozel';
import BehaviourModel from './BehaviourModel';
import TriggerModel, {UnknownTriggerModel} from "@examples/game-engine/models/TriggerModel";
import Vector3Model from "@examples/game-engine/models/Vector3Model";
import BaseComponentModel from "../BaseComponentModel";

export default class ObjectModel extends BaseComponentModel {
	static get type() { return 'Object'	};

	@property(Number, {required, default: 1})
	scale!:number;

	@property(Vector3Model, {required})
	position!:Vector3Model;

	@collection(ObjectModel)
	objects!:Collection<ObjectModel>;

	@collection(BehaviourModel)
	behaviours!:Collection<BehaviourModel>;

	@collection(TriggerModel)
	triggers!:Collection<UnknownTriggerModel>;

	@property(Boolean)
	selected?:boolean;
}
