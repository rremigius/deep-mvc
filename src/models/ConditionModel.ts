import Model from "mozel";
import {ControllerEvent, ControllerEventData} from "@/Controller";

export default class ConditionModel<E extends ControllerEvent<any>> extends Model {
	eval(data:ControllerEventData<E>):boolean {
		throw new Error("Not implemented")
	}
}
