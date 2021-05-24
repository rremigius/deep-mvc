import { assert } from "chai";
import {MozelFactory, property, schema} from "mozel";
import ControllerFactory from "../src/Controller/ControllerFactory";
import ViewFactory from "../src/View/ViewFactory";
import Controller, {controller} from "../src/Controller";
import View, {view} from "../src/View";
import ControllerSlot from "../src/Controller/ControllerSlot";
import ControllerModel from "../src/ControllerModel";
import ViewSlot from "../src/View/ViewSlot";

class FooModel extends ControllerModel {
	static get type() { return 'FooView' }

	@property(String)
	name?:string;
	@property(FooModel)
	foo?:FooModel
	@property(FooModel)
	bar?:FooModel
}

class FooController extends Controller {
	static ModelClass = FooModel;

	@controller(schema(FooModel).foo, FooController)
	foo!:ControllerSlot<FooController>;

	@controller(schema(FooModel).bar, FooController)
	bar!:ControllerSlot<FooController>;
}

class FooView extends View {
	static ModelClass = FooModel;
	get type() { return 'FooView' }

	controller?:FooController;

	init() {
		super.init();
		this.controller = this.findController(FooController);
	}

	@view(schema(FooModel).foo, FooView)
	foo!:ViewSlot<FooView>;

	@view(schema(FooModel).bar, FooView)
	bar!:ViewSlot<FooView>
}

function createFactories() {
	const mozelFactory = new MozelFactory();
	const controllerFactory = new ControllerFactory();
	const viewFactory = new ViewFactory(controllerFactory.registry);

	mozelFactory.register(FooModel);
	controllerFactory.register(FooController);
	viewFactory.register(FooView);

	return {
		model: mozelFactory,
		controller: controllerFactory,
		view: viewFactory
	};
}

describe("ViewFactory", () => {
	describe("create", () => {
		it("constructs a view hierarchy based on the given controller hierarchy", () => {
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
	});
	describe("created view", () => {
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
		it("has access to controller if available", () => {
			const factory = createFactories();
			const model = factory.model.create(FooModel, {
				name: 'root',
				foo: {
					name: 'foo'
				}
			});
			const controller = factory.controller.create(model, FooController);
			const view = factory.view.create(model, FooView);

			const fooController = controller.foo.get();
			const fooView = view.foo.get();

			assert.ok(fooController);
			assert.equal(fooView!.controller, fooController, "View has reference to Controller");
		});
	})
});
