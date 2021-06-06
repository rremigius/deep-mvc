import Model from "mozel";
import {ComponentEvent, ComponentEventData} from "@/Component";

export default class ConditionModel<E extends ComponentEvent<any>> extends Model {
	eval(data:ComponentEventData<E>):boolean {
		throw new Error("Not implemented")
	}
}
