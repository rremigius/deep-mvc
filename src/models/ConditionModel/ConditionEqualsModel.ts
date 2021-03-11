import ConditionModel, {ConditionType} from "@/models/ConditionModel";
import {property, required, GenericMozel} from "mozel";

import {findKey} from 'lodash';

type Data = {[key:string]:any}

export default class ConditionEqualsModel<T extends Data> extends ConditionModel<T> {

	@property(GenericMozel, {required})
	check!:GenericMozel<T>;

	eval(data:ConditionType<T>): boolean {
		const match = this.check.exportGeneric();
		let noMatch = findKey(match, (value:any, key:string) => {
			return data[key] !== match[key];
		});
		// Was a value found that did not match?
		return noMatch === undefined;
	}
}
