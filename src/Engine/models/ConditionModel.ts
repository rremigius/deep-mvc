import Model from "mozel";
import {ComponentEvent, ComponenetEventData} from "@/Component";

export default class ConditionModel<E extends ComponentEvent<any>> extends Model {
	eval(data:ComponenetEventData<E>):boolean {
		throw new Error("Not implemented")
	}
}
