import {assert} from 'chai';
import Controller, {injectable as injectableController} from "@/Controller";
import BehaviourModel from "@/models/BehaviourModel";
import {collection, Collection, MozelFactory, property, reference, injectable} from "mozel";
import ControllerFactory from "@/Controller/ControllerFactory";
import EngineInterface, {EngineActions, EngineEvents} from "@/Engine/EngineInterface";
import {FrameListener} from "@/Engine";
import {Container} from "inversify";
import CameraRenderInterface from "@/renderers/common/ObjectRenderInterface/CameraRenderInterface";
import ThreeCamera from "@/renderers/threejs/ThreeObject/ThreeCamera";
import ControllerList from "@/Controller/ControllerList";
import {isNil} from 'lodash';
import ControllerSync from "@/Controller/ControllerSync";
import ControllerModel from "@/models/ControllerModel";

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

	otherFoo?:FooController;
	childFoos:ControllerList<FooController> = new ControllerList<FooController>();

	get foo():FooModel {
		return <FooModel>this.model;
	}

	init(model: ControllerModel) {
		super.init(model);

		this.controller(this.foo.$property('otherFoo'), FooController, otherFoo => this.otherFoo = otherFoo);
		this.controllers(this.foo.$property('childFoos'), FooController, childFoos => this.childFoos = childFoos);
	}

	onResolveReferences() {
		super.onResolveReferences();
		this.otherFoo = this.resolveReference<FooController>(FooController, this.foo.otherFoo);
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
		const controllerFactory = new ControllerFactory(new MockEngine(), controllerContainer);

		const fooModel = modelFactory.create(FooModel, {}, true);
		const fooController = controllerFactory.create(fooModel, FooController);

		fooModel.childFoos.add(modelFactory.create(FooModel, {gid: 'foo1'}));

		// Check if non-exisitng models/controllers still return false on find
		assert.notOk(fooModel.childFoos.find({gid: 'nonexistent'}) instanceof FooModel, "Non-existing Model GID is not found");
		assert.notOk(fooController.childFoos.find({gid: 'nonexistent'}) instanceof FooController, "Non-existing Controller GID is not found.")

		let foo1Model = fooModel.childFoos.find({gid: 'foo1'});
		let foo1Controller = fooController.childFoos.find({gid: 'foo1'});
		let foo2Model = fooModel.childFoos.find({gid: 'foo2'});
		let foo2Controller = fooController.childFoos.find({gid: 'foo2'});
		assert.ok(foo1Model instanceof FooModel, "Model was added from Model.");
		assert.ok(foo1Controller instanceof FooController, "Controller was added from Model");
		assert.ok(foo2Model instanceof FooModel, "Model was added from Controller.");
		assert.ok(foo2Controller instanceof FooController, "Controller was added from Controller.");

		assert.equal(foo1Controller && foo1Controller.model, foo1Model, "Controller added from Model has reference to Model in Model hierarchy.");
		assert.equal(foo2Controller && foo2Controller.model, foo2Model, "Controller added from Controller has reference to Model in Model hierarchy.");

		foo1Model && fooModel.childFoos.remove(foo1Model);
		foo2Controller && fooController.childFoos.remove(foo2Controller);

		assert.ok(isNil(fooModel.childFoos.find({gid: 'foo1'})), "Model was removed from Model.");
		assert.ok(isNil(fooController.childFoos.find({gid: 'foo1'})), "Controller was removed from Model");
		assert.ok(isNil(fooModel.childFoos.find({gid: 'foo2'})), "Model was removed from Controller.");
		assert.ok(isNil(fooController.childFoos.find({gid: 'foo2'})), "Controller was removed from Controller.");
	});
	describe(".onResolveReferences", () => {
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

			const factory = new ControllerFactory(new MockEngine(), controllerContainer);
			const controller = factory.createAndResolveReferences(foo, FooController);

			const gid11 = controller.childFoos.find({gid: 11});
			const gid12 = controller.childFoos.find({gid: 12});
			assert.ok(gid11 instanceof Controller, "Child with GID 11 is a Controller.");
			assert.ok(gid12 instanceof Controller, "Child with GID 12 is a Controller.");
			assert.equal(gid11 && gid11.childFoos.find({gid:111}), gid12 && gid12.otherFoo);
		});
	});
	describe(".controller", () => {
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

				childBar?:BarController = this.controller(this.model.$p('childBar'), BarController, bar => this.childBar = bar).get();
				otherBar?:BarController = this.controller(this.model.$p('otherBar'), BarController, bar => this.otherBar = bar).get();
			}

			const barModel = modelFactory.create(BarModel, {
				gid: 1,
				childBar: {gid: 2},
				otherBar: {gid: 2}
			}, true);

			const factory = new ControllerFactory(new MockEngine(), container);
			const bar = factory.createAndResolveReferences<BarController>(barModel, BarController);

			assert.equal(bar.childBar, bar.otherBar, "Child and reference refer to same Controller");

			barModel.childBar = modelFactory.create(BarModel, {gid: 3});
			assert.equal(bar.childBar!.gid, 3, "Child controller updated");

			barModel.otherBar = modelFactory.create(BarModel, {gid: 4});
			assert.equal(bar.otherBar, undefined, "Non-existing GID on reference model does not resolve");

			barModel.otherBar = barModel.childBar;
			assert.equal(bar.otherBar, bar.childBar, "Setting reference to same model will resolve to same controller");
		});
	});
});
