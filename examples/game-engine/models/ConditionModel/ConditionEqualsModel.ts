import ConditionModel from "@examples/game-engine/models/ConditionModel";
import {GenericMozel, property, required} from "mozel";

import {findKey} from 'lodash';
import {ComponentEvent, ComponentEventData} from "@/Component";

export default class ConditionEqualsModel<E extends ComponentEvent<any>> extends ConditionModel<E> {

	@property(GenericMozel, {required})
	check!:GenericMozel<ComponentEventData<E>>;

	eval(data:ComponentEventData<E>): boolean {
		const match = this.check.exportGeneric();
		let noMatch = findKey(match, (value:any, key:string) => {
			return data[key] !== match[key];
		});
		// Was a value found that did not match?
		return noMatch === undefined;
	}
}
