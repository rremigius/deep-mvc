import {property, required, GenericMozel} from 'mozel';
import EventModel from "@/models/EventModel";
import ActionModel from "@/models/ActionModel";
import MappingModel from "@/models/MappingModel";
import ConditionModel from "@/models/ConditionModel";
import ControllerModel from "@/models/ControllerModel";
import {ControllerAction, ControllerEvent} from "@/Controller";

export type UnknownTriggerModel = TriggerModel<ControllerEvent<unknown>, ControllerAction<unknown>>;

type Payload<E> = E extends ControllerAction<infer A> ? A : unknown;

export default class TriggerModel<E, A> extends ControllerModel {
	static get type() { return 'Trigger' };

	@property(EventModel, {required})
	event!:EventModel;

	@property(ActionModel, {required})
	action!:ActionModel;

	@property(GenericMozel, {required})
	mapping!:MappingModel<Payload<A>, Payload<E>>;

	@property(ConditionModel)
	condition?:ConditionModel<E>
}
