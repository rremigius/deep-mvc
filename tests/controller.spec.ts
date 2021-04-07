import {assert} from 'chai';
import Controller, {controller, controllers} from "@/Controller";
import BehaviourModel from "@/Engine/models/BehaviourModel";
import Mozel, {collection, Collection, MozelFactory, property, reference, required, schema} from "mozel";
import ControllerFactory from "@/Controller/ControllerFactory";
import {isNil} from 'lodash';
import ControllerModel from "@/ControllerModel";
import ControllerSlot from "@/Controller/ControllerSlot";
import ControllerList from "@/Controller/ControllerList";

class FooModel extends BehaviourModel {
	static get type() { return 'FooModel'; }

	@property(FooModel, {reference})
	otherFoo?:FooModel;

	@collection(FooModel)
	childFoos!:Collection<FooModel>;
}

class FooController extends Controller {
	static ModelClass = FooModel;

	@controller(schema(FooModel).otherFoo, FooController)
	otherFoo!:ControllerSlot<FooController>;

	@controllers(schema(FooModel).childFoos, FooController)
	childFoos!:ControllerList<FooController>;

	get foo():FooModel {
		return <FooModel>this.model;
	}
}
class TestModelFactory extends MozelFactory {
	initDependencies() {
		super.initDependencies();
		this.register(FooModel);
	}
}
class TestControllerFactory extends ControllerFactory {
	initDependencies() {
		super.initDependencies();
		this.register(FooController);
	}
}

describe('Controller', () => {
	it('changing children in Mozel reflects in Controller', () => {
		const modelFactory = new TestModelFactory();
		const controllerFactory = new TestControllerFactory();

		const fooModel = modelFactory.create(FooModel, {}, true);
		const fooController = controllerFactory.createAndResolveReferences(fooModel, FooController);

		fooModel.childFoos.add(modelFactory.create(FooModel, {gid: 'foo1'}));

		// Check if non-exisitng models/controllers still return false on find
		assert.notOk(fooModel.childFoos.find({gid: 'nonexistent'}) instanceof FooModel, "Non-existing Model GID is not found");
		assert.notOk(fooController.childFoos.find({gid: 'nonexistent'}) instanceof FooController, "Non-existing Controller GID is not found.")

		let foo1Model = fooModel.childFoos.find({gid: 'foo1'});
		let foo1Controller = fooController.childFoos.find({gid: 'foo1'});
		assert.ok(foo1Model instanceof FooModel, "Model was added from Model.");
		assert.ok(foo1Controller instanceof FooController, "Controller was added from Model");

		assert.equal(foo1Controller && foo1Controller.model, foo1Model, "Controller added from Model has reference to Model in Model hierarchy.");

		foo1Model && fooModel.childFoos.remove(foo1Model);

		assert.ok(isNil(fooModel.childFoos.find({gid: 'foo1'})), "Model was removed from Model.");
		assert.ok(isNil(fooController.childFoos.find({gid: 'foo1'})), "Controller was removed from Model");
	});
	describe("controller", () => {
		it('syncs controller references based on model', ()=>{
			// Create instances
			const modelFactory = new TestModelFactory();

			class BarModel extends BehaviourModel {
				static get type() { return 'BarModel'; }

				@property(BarModel)
				childBar?:BarModel;

				@property(BarModel, {reference})
				otherBar?:BarModel;
			}
			modelFactory.register(BarModel);

			class BarController extends Controller {
				static ModelClass = BarModel;
				model!:BarModel; // TS: initialized in super constructor

				childBar = this.controller(this.model.$('childBar'), BarController)
				otherBar = this.controller(this.model.$('otherBar'), BarController)
			}

			const barModel = modelFactory.create(BarModel, {
				gid: 1,
				childBar: {gid: 2},
				otherBar: {gid: 2}
			}, true);

			const factory = new TestControllerFactory();
			factory.register(BarController);

			const bar = factory.createAndResolveReferences<BarController>(barModel, BarController);

			assert.equal(bar.childBar.get(), bar.otherBar.get(), "Child and reference refer to same Controller");

			barModel.childBar = modelFactory.create(BarModel, {gid: 3});
			assert.equal(bar.childBar.get()!.gid, 3, "Child controller updated");

			try {
				barModel.otherBar = modelFactory.create(BarModel, {gid: 4});
				assert.ok(false, "Non-existing GID on reference model does not resolve");
			} catch(e) {
				assert.ok(true, "Non-existing GID on reference model does not resolve");
			}

			barModel.otherBar = barModel.childBar;
			assert.equal(bar.otherBar.get(), bar.childBar.get(), "Setting reference to same model will resolve to same controller");
		});
		it('can resolve other Controllers from the Registry', () => {
			// Create instances
			const modelFactory = new TestModelFactory();
			const foo = modelFactory.create<FooModel>(FooModel, {
				gid: 1,
				childFoos: [
					{
						gid: 11,
						childFoos: [
							{ gid: 111 }
						]
					},
					{
						gid: 12,
						otherFoo: { gid: 111 }
					}
				]
			});

			const factory = new TestControllerFactory();
			const controller = factory.createAndResolveReferences(foo, FooController);

			const gid11 = controller.childFoos.find({gid: 11});
			const gid12 = controller.childFoos.find({gid: 12});
			assert.ok(gid11 instanceof Controller, "Child with GID 11 is a Controller.");
			assert.ok(gid12 instanceof Controller, "Child with GID 12 is a Controller.");
			assert.equal(gid11!.childFoos.find({gid:111}), gid12!.otherFoo.get());
		});
	});
	describe("@controller and @controllerList", () => {
		it("create a ControllerSlot and ControllerList, respectively", () => {
			class FooModel extends ControllerModel {
				@property(String, {required})
				name!:string;
				@property(FooModel)
				foo?:FooModel;
				@collection(FooModel)
				foos!:Collection<FooModel>;
			}
			const controllerFactory = Controller.createFactory();
			const modelFactory = Mozel.createFactory();
			modelFactory.register(FooModel);

			class FooController extends Controller {
				static ModelClass = FooModel;
				model!:FooModel;
				@controller('foo', FooController)
				foo!:ControllerSlot<FooController>;
				@controllers('foos', FooController)
				foos!:ControllerList<FooController>;
			}
			controllerFactory.register(FooController);

			const fooModel = modelFactory.create(FooModel, {
				foo: {name: 'foo1'},
				foos: [{name: 'foo2'}]
			});

			const fooController = controllerFactory.createAndResolveReferences(fooModel, FooController);

			assert.equal(fooController.foo.get()!.model, fooModel.foo, "ControllerSlot synchronized");
			assert.equal(fooController.foos.getIndex(0).model, fooModel.foos.get(0), "ControllerList synchronized");
		});
	});
});
