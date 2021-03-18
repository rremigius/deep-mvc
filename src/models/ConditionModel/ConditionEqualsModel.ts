import ConditionModel from "@/models/ConditionModel";
import {GenericMozel, property, required} from "mozel";

import {findKey} from 'lodash';
import {ControllerEvent, ControllerEventData} from "@/Controller";

export default class ConditionEqualsModel<E extends ControllerEvent<any>> extends ConditionModel<E> {

	@property(GenericMozel, {required})
	check!:GenericMozel<ControllerEventData<E>>;

	eval(data:ControllerEventData<E>): boolean {
		const match = this.check.exportGeneric();
		let noMatch = findKey(match, (value:any, key:string) => {
			return data[key] !== match[key];
		});
		// Was a value found that did not match?
		return noMatch === undefined;
	}
}
