import {assert} from 'chai';
import {MozelFactory} from "mozel";
import ConditionEqualsModel from "@examples/game-engine/models/ConditionModel/ConditionEqualsModel";
import {ComponentEvent} from "../src/Component";

describe("ConditionEqualsModel", () => {
	it('compares all keys and values in `check` property on equality.', ()=>{
		const factory = new MozelFactory();

		class FooEvent extends ComponentEvent<{foo?:string, bar?:number}> {}

		const condition = factory.create<ConditionEqualsModel<FooEvent>>(ConditionEqualsModel, {
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
