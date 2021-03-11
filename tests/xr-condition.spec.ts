import {assert} from 'chai';

import ConditionModel from "@/models/ConditionModel";
import {MozelFactory} from "mozel";
import ConditionEqualsModel from "@/models/ConditionModel/ConditionEqualsModel";

describe('ConditionModel', () => {
	it('.eval runs the evaluator property', () => {
		let called = false;

		const factory = new MozelFactory();

		const condition = factory.create<ConditionModel<string>>(ConditionModel, {
			evaluator: (data:string) => {
				assert.equal(data,'foo', "Event data in evaluator correct");
				called = true;
				return true;
			}
		});
		assert.equal(condition.eval('foo'), true);
		assert.equal(called, true, "Evaluator function called");
	});
	it('ConditionEquals compares all keys and values in `check` property on equality.', ()=>{
		const factory = new MozelFactory();

		type FooBar = { foo?:string, bar?:number };

		const condition = factory.create<ConditionEqualsModel<FooBar>>(ConditionEqualsModel, {
			check: { // type-checked
				foo: 'abc',
				bar: 123
			}
		});

		assert.equal(condition.eval({foo: 'abc', bar:123}), true, "Evaluated matching data as `true`");
		assert.equal(condition.eval({foo: 'cde', bar:123}), false, "Data with one property wrong evald as `false`.");
		assert.equal(condition.eval({}), false, "Empty data evaluated as `false`.");
	});
});
