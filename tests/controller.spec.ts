import {assert} from 'chai';
import Controller, {controller, controllers, injectable as injectableController} from "@/Controller";
import BehaviourModel from "@/models/BehaviourModel";
import Mozel, {collection, Collection, injectable, MozelFactory, property, reference, required} from "mozel";
import ControllerFactory from "@/Controller/ControllerFactory";
import EngineInterface, {EngineActions, EngineEvents} from "@/Engine/EngineInterface";
import {FrameListener} from "@/Engine";
import {Container} from "inversify";
import CameraRenderInterface from "@/renderers/common/ObjectRenderInterface/CameraRenderInterface";
import ThreeCamera from "@/renderers/threejs/ThreeObject/ThreeCamera";
import {isNil} from 'lodash';
import ControllerModel from "@/models/ControllerModel";
import ControllerSlot from "@/Controller/ControllerSlot";
import ControllerList from "@/Controller/ControllerList";

const modelContainer = new Container({autoBindInjectable:true});
const controllerContainer = new Container({autoBindInjectable:true});

@injectable(modelContainer)
class FooModel extends BehaviourModel {
	static get type() { return 'FooModel'; }

	@property(FooModel, {reference})
	otherFoo?:FooModel;

	@collection(FooModel)
	childFoos!:Collection<FooModel>;
}

@injectableController()
class FooController extends Controller {
	static ModelClass = FooModel;

	otherFoo = this.controller(this.foo.$property('otherFoo'), FooController);
	childFoos = this.controllers(this.foo.$property('childFoos'), FooController);

	get foo():FooModel {
		return <FooModel>this.model;
	}
}

class MockEngine implements EngineInterface {
	camera:CameraRenderInterface = new ThreeCamera();
	addFrameListener(f:FrameListener) { };
	removeFrameListener(f: FrameListener) { }
	events = new EngineEvents();
	actions = new EngineActions();
}

describe('Controller', () => {
	it('changing children in Mozel reflects in Controller', () => {
		const modelFactory = new MozelFactory(modelContainer);
		const controllerFactory = new ControllerFactory(controllerContainer);

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
	describe("onResolveReferences", () => {
		it('can resolve other Controllers from the Registry', () => {
			// Create instances
			const modelFactory = new MozelFactory(modelContainer);
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

			const factory = new ControllerFactory(controllerContainer);
			const controller = factory.createAndResolveReferences(foo, FooController);

			const gid11 = controller.childFoos.find({gid: 11});
			const gid12 = controller.childFoos.find({gid: 12});
			assert.ok(gid11 instanceof Controller, "Child with GID 11 is a Controller.");
			assert.ok(gid12 instanceof Controller, "Child with GID 12 is a Controller.");
			assert.equal(gid11!.childFoos.find({gid:111}), gid12!.otherFoo.get());
		});
	});
	describe("controller", () => {
		it('syncs controller references based on model', ()=>{
			// Create instances
			const modelFactory = new MozelFactory(modelContainer);
			const container = new Container({autoBindInjectable:true});

			class BarModel extends BehaviourModel {
				static get type() { return 'BarModel'; }

				@property(BarModel)
				childBar?:BarModel;

				@property(BarModel, {reference})
				otherBar?:BarModel;
			}

			@injectableController(container)
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

			const factory = new ControllerFactory(container);
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

			@injectableController(controllerFactory.diContainer)
			class FooController extends Controller {
				static ModelClass = FooModel;
				model!:FooModel;
				@controller('foo', FooController)
				foo!:ControllerSlot<FooController>;
				@controllers('foos', FooController)
				foos!:ControllerList<FooController>;
			}

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
