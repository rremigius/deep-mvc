import {assert} from "chai";
import {MozelFactory, property, schema} from "mozel";
import ComponentFactory from "../src/Component/ComponentFactory";
import ViewFactory from "../src/View/ViewFactory";
import Component, {component} from "../src/Component";
import ComponentSlot from "../src/Component/ComponentSlot";
import View from "../src/View";
import ViewModel from "../src/ViewModel";

class FooModel extends ViewModel {
	static get type() { return 'FooModel' }

	@property(FooModel)
	foo?:FooModel
	@property(FooModel)
	bar?:FooModel
}

class FooComponent extends Component {
	static Model = FooModel;

	@component(schema(FooModel).foo, FooComponent)
	foo!:ComponentSlot<FooComponent>;

	@component(schema(FooModel).bar, FooComponent)
	bar!:ComponentSlot<FooComponent>;
}

class FooView extends View {
	static Model = FooModel;
	get type() { return 'FooView' }

	component?:FooComponent;

	init(model:ViewModel) {
		super.init(model);
		this.component = this.findController(FooComponent);
	}

	@component(schema(FooModel).foo, FooView)
	foo!:ComponentSlot<FooView>;

	@component(schema(FooModel).bar, FooView)
	bar!:ComponentSlot<FooView>
}

function createFactories() {
	const mozelFactory = new MozelFactory();
	const componentFactory = new ComponentFactory();
	const viewFactory = new ViewFactory(componentFactory.registry);

	mozelFactory.register(FooModel);
	componentFactory.register(FooComponent);
	viewFactory.register(FooView);

	return {
		model: mozelFactory,
		component: componentFactory,
		view: viewFactory
	};
}

describe("ViewFactory", () => {
	describe("create", () => {
		it("constructs a view hierarchy based on the given component hierarchy", () => {
			const factory = createFactories();

			const model = factory.model.create(FooModel, {
				name: 'root',
				foo: {
					name: 'foo'
				}
			});
			const view = factory.view.create(model, FooView);

			assert.instanceOf(view.foo.get(), FooView, "FooView child instantiated");
			assert.equal(view.foo.get()!.model, model.foo, "FooView child has access to child model");
		});
		describe("(created view)", () => {
			it("modifies view hierarchy based on changes in the model", () => {
				const factory = createFactories();

				const model = factory.model.create(FooModel, {
					name: 'root',
					foo: {
						name: 'foo',
						foo: {name: 'foofoo'}
					},
					bar: {
						name: 'bar'
					}
				});
				const view = factory.view.create(model, FooView);

				const foofooView = view.foo.get()!.foo.get();
				assert.ok(foofooView, "foo.foo created at 3rd level");
				assert.notOk(view.bar.get()!.bar.get(), "bar.bar path not available");

				// Transfer foofoo model
				model.bar!.bar = model.foo!.foo;

				assert.notOk(view.foo.get()!.foo.get(), "foo.foo path no longer available");
				assert.equal(view.bar.get()!.bar.get(), foofooView, "foo.foo view transferred to bar.bar path");
			});
			it("has access to component if available", () => {
				const factory = createFactories();
				const model = factory.model.create(FooModel, {
					name: 'root',
					foo: {
						name: 'foo'
					}
				});
				const component = factory.component.create(model, FooComponent);
				const view = factory.view.create(model, FooView);

				const fooComponent = component.foo.get();
				const fooView = view.foo.get();

				assert.ok(fooComponent);
				assert.equal(fooView!.component, fooComponent, "View has reference to Component");
			});
		})
	});
});
