import Model from "mozel";
import {ControllerEvent} from "@/Controller";

// Out-of the box for ControllerEvent conditions
export type ConditionType<T> = T extends ControllerEvent<infer E> ? E : T;

export default class ConditionModel<T> extends Model {
	eval(data:ConditionType<T>):boolean {
		throw new Error("Not implemented")
	}
}
