import {collection, Collection, property, required} from 'mozel';
import BehaviourModel from './BehaviourModel';

import Vector3Model from "@/Engine/models/Vector3Model";
import TriggerModel, {UnknownTriggerModel} from "@/Engine/models/TriggerModel";
import ControllerModel from "@/ControllerModel";

export default class ObjectModel extends ControllerModel {
	static get type() { return 'Object'	};

	@property(String, {required, default: "ObjectModel"})
	name!:string;

	@property(Number, {required, default: 1})
	scale!:number;

	@property(Vector3Model, {required})
	position!:Vector3Model;

	@collection(BehaviourModel)
	behaviours!:Collection<BehaviourModel>;

	@collection(TriggerModel)
	triggers!:Collection<UnknownTriggerModel>;
}
