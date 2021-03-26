import {property, required, GenericMozel} from 'mozel';
import EventModel from "@/Engine/models/EventModel";
import ActionModel from "@/Engine/models/ActionModel";
import MappingModel from "@/Engine/models/MappingModel";
import ConditionModel from "@/Engine/models/ConditionModel";
import ControllerModel from "@/ControllerModel";
import {ControllerAction, ControllerActionData, ControllerEvent, ControllerEventData} from "@/Controller";

export type UnknownTriggerModel = TriggerModel<ControllerEvent<object>, ControllerAction<object>>;

export default class TriggerModel<E extends ControllerEvent<any>, A extends ControllerAction<any>> extends ControllerModel {
	static get type() { return 'Trigger' };

	@property(EventModel, {required})
	event!:EventModel;

	@property(ActionModel, {required})
	action!:ActionModel;

	@property(GenericMozel, {required})
	mapping!:MappingModel<ControllerActionData<A>, ControllerEventData<E>>;

	@property(ConditionModel)
	condition?:ConditionModel<E>
}
