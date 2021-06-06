import {GenericMozel, property, required} from 'mozel';
import EventModel from "@examples/GameEngine/models/EventModel";
import ActionModel from "@examples/GameEngine/models/ActionModel";
import MappingModel from "@examples/GameEngine/models/MappingModel";
import ConditionModel from "@examples/GameEngine/models/ConditionModel";
import {ComponentAction, ComponentActionData, ComponentEvent, ComponentEventData} from "@/Component";
import BaseComponentModel from "@examples/GameEngine/BaseComponentModel";

export type UnknownTriggerModel = TriggerModel<ComponentEvent<object>, ComponentAction<object>>;

export default class TriggerModel<E extends ComponentEvent<any>, A extends ComponentAction<any>> extends BaseComponentModel {
	static get type() { return 'Trigger' };

	@property(EventModel, {required})
	event!:EventModel;

	@property(ActionModel, {required})
	action!:ActionModel;

	@property(GenericMozel, {required})
	mapping!:MappingModel<ComponentActionData<A>, ComponentEventData<E>>;

	@property(ConditionModel)
	condition?:ConditionModel<E>
}
