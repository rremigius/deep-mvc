import {assert} from 'chai';
import Controller, {injectableController} from "@/Controller";
import BehaviourModel from "@/models/BehaviourModel";
import Mozel, {collection, property, reference, injectable, MozelFactory, Collection} from "mozel";
import ControllerFactory from "@/Controller/ControllerFactory";
import EngineInterface from "@/Engine/EngineInterface";
import {FrameListener} from "@/Engine";
import {Container} from "inversify";
import CameraRenderInterface from "@/renderers/common/ObjectRenderInterface/CameraRenderInterface";
import ThreeCamera from "@/renderers/threejs/ThreeObject/ThreeCamera";
import EventInterface from "event-interface-mixin";
import ControllerList from "@/Controller/ControllerList";
import {isNil} from 'lodash';
import ModelControllerSync from "@/Controller/ModelControllerSync";
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

@injectableController(controllerContainer)
class FooController extends Controller {
	static ModelClass = FooModel;

	childFoos:ControllerList<FooController> = this.createControllerList(this.foo.childFoos, FooController);
	otherFoo?:FooController;

	get foo():FooModel {
		return <FooModel>this.model;
	}
	onResolveReferences() {
		super.onResolveReferences();
		this.otherFoo = this.resolveReference<FooController>(FooController, this.foo.otherFoo);
	}
}

class MockEngine implements EngineInterface {
	camera:CameraRenderInterface<unknown> = new ThreeCamera();
	addFrameListener(f:FrameListener) { };
	callAction(action: string, payload: any) { }
	removeFrameListener(f: FrameListener) { }
	eventInterface = new EventInterface();
	on = this.eventInterface.getOnMethod();
	off = this.eventInterface.getOffMethod();
	fire = this.eventInterface.getFireMethod();
}

describe('Controller', () => {
	it('.onResolveReferences can resolve other Controllers from the Registry', () => {
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
		const controller = factory.create<FooController>(FooController, foo, true);

		const gid11 = controller.childFoos.find({gid: 11});
		const gid12 = controller.childFoos.find({gid: 12});
		assert.ok(gid11 instanceof Controller, "Child with GID 11 is an Controller.");
		assert.ok(gid12 instanceof Controller, "Child with GID 12 is an Controller.");
		assert.equal(gid11 && gid11.childFoos.find({gid:111}), gid12 && gid12.otherFoo);
	});
	it('.setupControllerSync syncs controller references based on model and model based on controller.', ()=>{
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

			childBarSync:ModelControllerSync<BarController> = this.createControllerSync<BarController>('childBar', BarController, true);
			otherBarSync:ModelControllerSync<BarController> = this.createControllerSync<BarController>('otherBar', BarController);
		}

		const barModel = modelFactory.create(BarModel, {
			gid: 1,
			childBar: {gid: 2},
			otherBar: {gid: 2}
		}, true);

		const factory = new ControllerFactory(new MockEngine(), container);
		const bar = factory.create<BarController>(BarController, barModel, true);

		assert.equal(bar.childBarSync.get(), bar.otherBarSync.get(), "Child and reference refer to same Controller");

		barModel.childBar = modelFactory.create(BarModel, {gid: 3});
		assert.equal(bar.childBarSync.get()!.gid, 3, "Child controller updated");

		barModel.otherBar = modelFactory.create(BarModel, {gid: 4});
		assert.equal(bar.otherBarSync.get(), undefined, "Non-existing GID on reference model does not resolve");

		barModel.otherBar = barModel.childBar;
		assert.equal(bar.otherBarSync.get(), bar.childBarSync.get(), "Setting reference to same model will resolve to same controller");
	});
	it('changing children in Controller syncs with Model and vice versa.', () => {
		const modelFactory = new MozelFactory(modelContainer);
		const controllerFactory = new ControllerFactory(new MockEngine(), controllerContainer);

		const fooModel = modelFactory.create(FooModel, {}, true);
		const fooController = controllerFactory.create(FooController, fooModel, true);

		fooModel.childFoos.add(modelFactory.create(FooModel, {gid: 'foo1'}));
		fooController.childFoos.add(controllerFactory.create(FooController, modelFactory.create(FooModel, {gid: 'foo2'})));

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
});
