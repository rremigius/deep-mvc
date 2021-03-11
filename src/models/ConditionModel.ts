import Model, {property, required} from "mozel";
import {Event} from "event-interface-mixin";

// Out-of the box for Event conditions
export type ConditionType<T> = T extends Event<infer E> ? E : T;

export default class ConditionModel<T> extends Model {
	@property(Function, {required})
	evaluator!:(data:ConditionType<T>)=>boolean;

	eval(data:ConditionType<T>):boolean {
		return this.evaluator(data);
	}
}
