import ControllerList from "@/Controller/ControllerList";
import ControllerModel from "@/ControllerModel";
import {Collection, collection} from "mozel";
import ControllerFactory from "@/Controller/ControllerFactory";
import Controller from "@/Controller";
import {assert} from "chai";

describe("ControllerList", () => {
	it("cleans up listeners from collection after collection was removed", () => {
		const factory = new ControllerFactory();

		class FooModel extends ControllerModel {
			@collection(FooModel)
			foos!:Collection<FooModel>;
		}
		class FooController extends Controller {
			static ModelClass = FooModel
			model!:FooModel;
		}
		factory.register(FooController);

		const foo = FooModel.create<FooModel>();
		const controllerList = new ControllerList(foo, 'foos', FooModel, FooController, factory);
		controllerList.startWatching();

		assert.equal(controllerList.count(), 0, "No controllers initially");

		const foos = foo.foos;
		foos.add(FooModel.create());
		assert.equal(controllerList.count(), 1, "One controller after adding Model to Collection");

		foo.foos = new Collection<FooModel>(foo, 'foos', FooModel);
		assert.equal(controllerList.count(), 0, "No controllers after Collection replaced");

		foos.add(FooModel.create());
		assert.equal(controllerList.count(), 0, "Still no controllers after initial Collection added new Model");

		foo.foos.add(FooModel.create());
		assert.equal(controllerList.count(), 1, "Again one controller after Model added to new Collection");
	});
})
