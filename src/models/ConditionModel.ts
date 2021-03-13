import Model, {property, required} from "mozel";
import {ControllerEvent} from "@/Controller";

// Out-of the box for ControllerEvent conditions
export type ConditionType<T> = T extends ControllerEvent<infer E> ? E : T;

export default class ConditionModel<T> extends Model {
	@property(Function, {required})
	evaluator!:(data:ConditionType<T>)=>boolean;

	eval(data:ConditionType<T>):boolean {
		return this.evaluator(data);
	}
}
