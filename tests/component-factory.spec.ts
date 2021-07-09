import {ComponentFactory} from "../src";
import Mozel from "mozel";
import Component from "../src/Component"
import {assert} from 'chai';

describe("ComponentFactory", () => {
	describe("registerDefault", () => {
		it("registers a Component class to be used as default for any (inheriting) Mozel class that has no binding.", () => {
			class BaseModel extends Mozel {}
			class FooModel extends BaseModel {}
			class BarModel extends FooModel {}

			class BaseComponent extends Component {
				static Model = BaseModel;
			}
			class FooComponent extends BaseComponent {
				static Model = FooModel;
			}

			const foo = new FooModel();
			const bar = new BarModel();

			const factory = new ComponentFactory();
			factory.register(BaseComponent);
			factory.register(FooComponent);

			const fooComponent = factory.create(foo, BaseComponent);
			const barComponent = factory.create(bar, BaseComponent);

			assert.instanceOf(fooComponent, FooComponent);
			assert.instanceOf(barComponent, FooComponent);
		});
	})
});
