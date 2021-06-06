import {assert} from 'chai';
import Component, {component, components} from "../src/Component";
import Mozel, {collection, Collection, MozelFactory, property, reference, required, schema} from "mozel";
import ComponentFactory from "@/Component/ComponentFactory";
import {isNil} from 'lodash';
import ComponentSlot from "@/Component/ComponentSlot";
import ComponentList from "@/Component/ComponentList";

class FooModel extends Mozel {
	static get type() { return 'FooModel'; }

	@property(FooModel, {reference})
	otherFoo?:FooModel;

	@collection(FooModel)
	childFoos!:Collection<FooModel>;
}

class FooComponent extends Component {
	static Model = FooModel;

	@component(schema(FooModel).otherFoo, FooComponent)
	otherFoo!:ComponentSlot<FooComponent>;

	@components(schema(FooModel).childFoos, FooComponent)
	childFoos!:ComponentList<FooComponent>;

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
class TestComponentFactory extends ComponentFactory {
	initDependencies() {
		super.initDependencies();
		this.register(FooComponent);
	}
}

describe('Component', () => {
	it('changing children in Mozel reflects in Component', () => {
		const modelFactory = new TestModelFactory();
		const componentFactory = new TestComponentFactory();

		const fooModel = modelFactory.create(FooModel, {}, true);
		const fooComponent = componentFactory.createAndResolveReferences(fooModel, FooComponent);

		fooModel.childFoos.add(modelFactory.create(FooModel, {gid: 'foo1'}));

		// Check if non-exisitng models/components still return false on find
		assert.notOk(fooModel.childFoos.find({gid: 'nonexistent'}) instanceof FooModel, "Non-existing Model GID is not found");
		assert.notOk(fooComponent.childFoos.find({gid: 'nonexistent'}) instanceof FooComponent, "Non-existing Component GID is not found.")

		let foo1Model = fooModel.childFoos.find({gid: 'foo1'});
		let foo1Component = fooComponent.childFoos.find({gid: 'foo1'});
		assert.ok(foo1Model instanceof FooModel, "Model was added from Model.");
		assert.ok(foo1Component instanceof FooComponent, "Component was added from Model");

		assert.equal(foo1Component && foo1Component.model, foo1Model, "Component added from Model has reference to Model in Model hierarchy.");

		foo1Model && fooModel.childFoos.remove(foo1Model);

		assert.ok(isNil(fooModel.childFoos.find({gid: 'foo1'})), "Model was removed from Model.");
		assert.ok(isNil(fooComponent.childFoos.find({gid: 'foo1'})), "Component was removed from Model");
	});
	describe("component", () => {
		it('syncs component references based on model', ()=>{
			// Create instances
			const modelFactory = new TestModelFactory();

			class BarModel extends Mozel {
				static get type() { return 'BarModel'; }

				@property(BarModel)
				childBar?:BarModel;

				@property(BarModel, {reference})
				otherBar?:BarModel;
			}
			modelFactory.register(BarModel);

			class BarComponent extends Component {
				static Model = BarModel;
				model!:BarModel; // TS: initialized in super constructor

				childBar = this.setupSubComponent(this.model.$('childBar'), BarComponent)
				otherBar = this.setupSubComponent(this.model.$('otherBar'), BarComponent)
			}

			const barModel = modelFactory.create(BarModel, {
				gid: 1,
				childBar: {gid: 2},
				otherBar: {gid: 2}
			}, true);

			const factory = new TestComponentFactory();
			factory.register(BarComponent);

			const bar = factory.createAndResolveReferences<BarComponent>(barModel, BarComponent);

			assert.equal(bar.childBar.get(), bar.otherBar.get(), "Child and reference refer to same Component");

			barModel.childBar = modelFactory.create(BarModel, {gid: 3});
			assert.equal(bar.childBar.get()!.gid, 3, "Child component updated");

			try {
				barModel.otherBar = modelFactory.create(BarModel, {gid: 4});
				assert.ok(false, "Non-existing GID on reference model does not resolve");
			} catch(e) {
				assert.ok(true, "Non-existing GID on reference model does not resolve");
			}

			barModel.otherBar = barModel.childBar;
			assert.equal(bar.otherBar.get(), bar.childBar.get(), "Setting reference to same model will resolve to same component");
		});
		it('can resolve other Components from the Registry', () => {
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

			const factory = new TestComponentFactory();
			const component = factory.createAndResolveReferences(foo, FooComponent);

			const gid11 = component.childFoos.find({gid: 11});
			const gid12 = component.childFoos.find({gid: 12});
			assert.ok(gid11 instanceof Component, "Child with GID 11 is a Component.");
			assert.ok(gid12 instanceof Component, "Child with GID 12 is a Component.");
			assert.equal(gid11!.childFoos.find({gid:111}), gid12!.otherFoo.get());
		});
	});
	describe("@component and @componentList", () => {
		it("create a ComponentSlot and ComponentList, respectively", () => {
			class FooModel extends Mozel {
				@property(String, {required})
				name!:string;
				@property(FooModel)
				foo?:FooModel;
				@collection(FooModel)
				foos!:Collection<FooModel>;
			}
			const componentFactory = Component.createFactory();
			const modelFactory = Mozel.createFactory();
			modelFactory.register(FooModel);

			class FooComponent extends Component {
				static Model = FooModel;
				model!:FooModel;
				@component('foo', FooComponent)
				foo!:ComponentSlot<FooComponent>;
				@components('foos', FooComponent)
				foos!:ComponentList<FooComponent>;
			}
			componentFactory.register(FooComponent);

			const fooModel = modelFactory.create(FooModel, {
				foo: {name: 'foo1'},
				foos: [{name: 'foo2'}]
			});

			const fooComponent = componentFactory.createAndResolveReferences(fooModel, FooComponent);

			assert.equal(fooComponent.foo.get()!.model, fooModel.foo, "ComponentSlot synchronized");
			assert.equal(fooComponent.foos.getIndex(0).model, fooModel.foos.get(0), "ComponentList synchronized");
		});
	});
	describe("enable", () => {
		it("can disable all children, and re-enable only those that were not disabled before", () => {
			class FooModel extends Mozel {
				@property(FooModel)
				left?:FooModel;
				@property(FooModel)
				right?:FooModel;
			}
			class FooComponent extends Component {
				static Model = FooModel;
				model!:FooModel;
				@component(schema(FooModel).left, FooComponent)
				left!:ComponentSlot<FooComponent>;
				@component(schema(FooModel).right, FooComponent)
				right!:ComponentSlot<FooComponent>;
			}

			const models = Mozel.createFactory();
			models.register(FooModel);
			const components = Component.createFactory();
			components.register(FooComponent);

			const model = models.create(FooModel, {
				gid: 'root',
				left: {
					gid: 1,
					left: {
						gid: 12
					},
					right: {
						gid: 13
					}
				},
			});
			const ctrl = components.create(model, FooComponent);
			const ctrl1 = components.registry.byGid(1) as FooComponent;
			const ctrl12 = components.registry.byGid(12) as FooComponent;
			const ctrl13 = components.registry.byGid(13) as FooComponent;

			assert.equal(ctrl.enabled, false, "Root disabled before start.");
			assert.equal(ctrl1.enabled, false, "Ctrl1 disabled before start.");
			assert.equal(ctrl12.enabled, false, "Ctrl12 disabled before start.");
			assert.equal(ctrl13.enabled, false, "Ctrl13 disabled before start.");

			ctrl.start();

			assert.equal(ctrl.enabled, true, "Root enabled after start.");
			assert.equal(ctrl1.enabled, true, "Ctrl1 enabled after start.");
			assert.equal(ctrl12.enabled, true, "Ctrl12 enabled after start.");
			assert.equal(ctrl13.enabled, true, "Ctrl13 enabled after start.");

			ctrl13.enable(false);

			assert.equal(ctrl13.enabled, false, "Ctrl13 disabled after disable.");

			ctrl.enable(false);

			assert.equal(ctrl.enabled, false, "Root disabled after root disable.");
			assert.equal(ctrl1.enabled, false, "Ctrl1 disabled after root disable.");
			assert.equal(ctrl12.enabled, false, "Ctrl12 disabled after root disable.");
			assert.equal(ctrl13.enabled, false, "Ctrl13 disabled after root disable.");

			ctrl.enable(true);

			assert.equal(ctrl.enabled, true, "Root enabled after root enable.");
			assert.equal(ctrl1.enabled, true, "Ctrl1 enabled after root enable.");
			assert.equal(ctrl12.enabled, true, "Ctrl12 enabled after root enable.");
			assert.equal(ctrl13.enabled, false, "Ctrl13 still disabled after root enable.");
		});
	});
	describe("toTree", () => {
		it("generates a nested object with all sub-components", () => {
			const modelFactory = new TestModelFactory();
			const componentFactory = new TestComponentFactory();

			const model = modelFactory.createAndResolveReferences(FooModel, {
				gid: 'a',
				otherFoo: {
					gid: 'a0'
				},
				childFoos: [{
					gid: 'a0', otherFoo: {gid: 'a'}
				}]
			});
			const component = componentFactory.createAndResolveReferences(model, FooComponent);

			const tree = <any>component.toTree();

			assert.equal(tree.gid, 'a');
			assert.equal(tree.otherFoo.gid, 'a0');
			assert.equal(tree.childFoos[0].gid, 'a0');
			assert.equal(tree.childFoos[0].otherFoo.gid, 'a');
			assert.equal(tree.childFoos[0].otherFoo._this, component);
		});
	});
});
