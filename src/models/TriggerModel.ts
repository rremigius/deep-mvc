import {property, required, GenericMozel} from 'mozel';
import EventModel from "@/models/EventModel";
import ActionModel from "@/models/ActionModel";
import MappingModel from "@/models/MappingModel";
import ConditionModel from "@/models/ConditionModel";
import ControllerModel from "@/models/ControllerModel";
import {Event} from "event-interface-mixin";
import {Action} from "@/Controller";

export default class TriggerModel<E extends Event<unknown>, A extends Action<unknown>> extends ControllerModel {
	static get type() { return 'Trigger' };

	@property(EventModel, {required})
	event!:EventModel;

	@property(ActionModel, {required})
	action!:ActionModel;

	@property(GenericMozel, {required})
	mapping!:MappingModel<A, E>;

	@property(ConditionModel)
	condition?:ConditionModel<E>
}
