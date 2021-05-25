import {property, required, GenericMozel} from 'mozel';
import EventModel from "@/Engine/models/EventModel";
import ActionModel from "@/Engine/models/ActionModel";
import MappingModel from "@/Engine/models/MappingModel";
import ConditionModel from "@/Engine/models/ConditionModel";
import ComponentModel from "@/ComponentModel";
import {ComponentAction, ComponentActionData, ComponentEvent, ComponenetEventData} from "@/Component";

export type UnknownTriggerModel = TriggerModel<ComponentEvent<object>, ComponentAction<object>>;

export default class TriggerModel<E extends ComponentEvent<any>, A extends ComponentAction<any>> extends ComponentModel {
	static get type() { return 'Trigger' };

	@property(EventModel, {required})
	event!:EventModel;

	@property(ActionModel, {required})
	action!:ActionModel;

	@property(GenericMozel, {required})
	mapping!:MappingModel<ComponentActionData<A>, ComponenetEventData<E>>;

	@property(ConditionModel)
	condition?:ConditionModel<E>
}
