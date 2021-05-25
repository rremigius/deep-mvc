import ComponentList from "@/Component/ComponentList";
import ComponentModel from "@/ComponentModel";
import {Collection, collection} from "mozel";
import ComponentFactory from "@/Component/ComponentFactory";
import Component from "../src/Component";
import {assert} from "chai";

describe("ComponentList", () => {
	it("cleans up listeners from collection after collection was removed", () => {
		const factory = new ComponentFactory();

		class FooModel extends ComponentModel {
			@collection(FooModel)
			foos!:Collection<FooModel>;
		}
		class FooComponent extends Component {
			static Model = FooModel
			model!:FooModel;
		}
		factory.register(FooComponent);

		const foo = FooModel.create<FooModel>();

		const fooComponent = factory.create(foo);
		const componentList = new ComponentList(fooComponent, foo, 'foos', FooModel, FooComponent, factory);
		componentList.startWatching();

		assert.equal(componentList.count(), 0, "No components initially");

		const foos = foo.foos;
		foos.add(FooModel.create());
		assert.equal(componentList.count(), 1, "One component after adding Model to Collection");

		foo.foos = new Collection<FooModel>(foo, 'foos', FooModel);
		assert.equal(componentList.count(), 0, "No components after Collection replaced");

		foos.add(FooModel.create());
		assert.equal(componentList.count(), 0, "Still no components after initial Collection added new Model");

		foo.foos.add(FooModel.create());
		assert.equal(componentList.count(), 1, "Again one component after Model added to new Collection");
	});
})
