import {assert} from 'chai';
import {describe} from 'mocha';
import {MozelFactory} from "mozel";
import TriggerComponent from "@examples/game-engine/controllers/TriggerController";
import ComponentFactory from "@/Component/ComponentFactory";
import {Container} from "inversify";
import SceneModel from "@examples/game-engine/models/SceneModel";
import ObjectModel from "@examples/game-engine/models/ObjectModel";
import SceneComponent from "@examples/game-engine/controllers/SceneController";
import ActionModel from "@examples/game-engine/models/ActionModel";
import TriggerModel from "@examples/game-engine/models/TriggerModel";
import BehaviourModel from "@examples/game-engine/models/BehaviourModel";
import BehaviourComponent from "@examples/game-engine/controllers/BehaviourController";
import {ComponentAction, ComponentEvent} from "@/Component";
import ConditionEqualsModel from "@examples/game-engine/models/ConditionModel/ConditionEqualsModel";
import EngineControllerFactory from "@examples/game-engine/controllers/EngineControllerFactory";

class Factory {
	model:MozelFactory;
	component:ComponentFactory;

	constructor(config?:{modelContainer?:Container, componentContainer?:Container}) {
		this.model = new MozelFactory(config && config.modelContainer);
		this.component = new EngineControllerFactory();
	}
}

class FooEvent extends ComponentEvent<{foo:string}> {}
class FooAction extends ComponentAction<{foo:string}> {}
class BarEvent extends ComponentEvent<{bar:string}> {}
class BarAction extends ComponentAction<{bar:string}> {}

describe('TriggerComponent', () => {
	it('listens to an event on source Behaviour and calls an action on its target Behaviour', done => {
		const factory = new Factory();

		const fooModel = factory.model.create<BehaviourModel>(BehaviourModel, {gid: 'fooBehaviour'});
		const barModel = factory.model.create<BehaviourModel>(BehaviourModel, {gid: 'barBehaviour'});

		const triggerModel = factory.model.createAndResolveReferences<TriggerModel<FooEvent, BarAction>>(TriggerModel, {
			event: {
				name: FooEvent.name,
				source: {gid: 'fooBehaviour'},
			},
			action: {
				name: BarAction.name,
				target: {gid: 'barBehaviour'}
			},
			mapping: {bar: "foo"}
		});

		const expected = 'bar';

		const foo = factory.component.createAndResolveReferences(fooModel, BehaviourComponent);
		const bar = factory.component.createAndResolveReferences(barModel, BehaviourComponent);

		foo.actions.$action(BarAction).on(() => {
			assert.ok(false, "BarAction on Foo was avoided");
		});
		bar.actions.$action(BarAction).on(action => {
			assert.deepEqual(action && action.data.bar, expected, "BarAction on Bar called with correct data");
			done();
		});

		const trigger = factory.component.createAndResolveReferences(triggerModel, TriggerComponent);
		trigger.start();

		foo.events.$fire(new FooEvent(foo, {foo: expected}));
	});

	it('listens to an event on the EventBus if no source is provided on event model', done => {
		const factory = new Factory();

		// Create Models
		const barBehaviourModel = factory.model.create(BehaviourModel, {gid: 'barBehaviour'});

		const triggerModel = factory.model.create<TriggerModel<FooEvent, BarAction>>(TriggerModel, {
			gid: 'trigger',
			event: {
				name: FooEvent.name
			},
			action: factory.model.create(ActionModel, { // just to show that you can also mix Models with plain data
				target: barBehaviourModel,
				name: BarAction.name
			}),
			mapping: { bar: "foo"} // Try putting different values here :)
		});

		const expected = 'correct';

		// Create Components
		const behaviourCtl = factory.component.create(barBehaviourModel, BehaviourComponent);
		behaviourCtl.actions.$action(BarAction).on(received => {
			assert.equal(received && received.data.bar, expected);
			done();
		});

		const triggerCtl = factory.component.createAndResolveReferences(triggerModel, TriggerComponent);
		triggerCtl.start();

		const eventBus = triggerCtl.eventBus;
		eventBus.$fire(new FooEvent(undefined, { foo: expected }));
	});
	it('with condition is not fired if condition is not met.', done=>{
		const factory = new Factory();
		const fooModel = factory.model.create(BehaviourModel, {gid: 'fooBehaviour'});

		const negativeModel = factory.model.create(BehaviourModel, {gid: 'negative'});
		const positiveModel = factory.model.create(BehaviourModel, {gid: 'positive'});

		const correctValue = 'correct';
		const incorrectValue = 'incorrect';

		const negativeTriggerModel = factory.model.create<TriggerModel<FooEvent, BarAction>>(TriggerModel, {
			event: { source: fooModel, name: FooEvent.name },
			action: { target: negativeModel, name: BarAction.name },
			condition: factory.model.create<ConditionEqualsModel<FooEvent>>(ConditionEqualsModel, {
				check: { foo: incorrectValue }
			})
		});

		const positiveTriggerModel = factory.model.create<TriggerModel<FooEvent, BarAction>>(TriggerModel, {
			event: { source: fooModel, name: FooEvent.name },
			action: { target: positiveModel, name: BarAction.name },
			condition: factory.model.create<ConditionEqualsModel<FooEvent>>(ConditionEqualsModel, {
				check: { foo: correctValue }
			})
		});

		const foo = factory.component.create(fooModel, BehaviourComponent);
		const negative = factory.component.create(negativeModel, BehaviourComponent);
		const positive = factory.component.create(positiveModel, BehaviourComponent);

		negative.actions.$action(BarAction).on(() => {
			assert.ok(false, "Non-matching trigger did not call target action.");
		});
		positive.actions.$action(BarAction).on(() => {
			assert.ok(true, "Matching trigger called target action.");
			done();
		});

		const negativeTrigger = factory.component.createAndResolveReferences(negativeTriggerModel);
		const positiveTrigger = factory.component.createAndResolveReferences(positiveTriggerModel);

		negativeTrigger.start();
		positiveTrigger.start();

		foo.events.$fire(new FooEvent(undefined, {foo: correctValue}));
	});
	it('with default component uses that component for actions and events if no behaviour specified.', done=>{
		const factory = new Factory();
		const model = factory.model.create(BehaviourModel);
		const component = factory.component.create(model, BehaviourComponent);
		component.actions.$action(BarAction).on(() => {
			assert.ok(true, "Action called on default component.");
			done();
		});

		const triggerModel = factory.model.create(TriggerModel, {
			event: {
				name: FooEvent.name
			},
			action: {
				name: BarAction.name
			}
		});
		const triggerComponent = factory.component.create(triggerModel, TriggerComponent);
		triggerComponent.setDefaultController(component);
		triggerComponent.start();

		component.events.$fire(new FooEvent(component, {foo: 'bar'}));
	});
	it('can be used on SceneComponent, ObjectComponent and BehaviourComponent.', done=>{
		const factory = new Factory();

		class SceneEvent extends ComponentEvent<object> {}
		class ObjectEvent extends ComponentEvent<object> {}
		class BehaviourEvent extends ComponentEvent<object> {}
		class SceneAction extends ComponentAction<object> {}
		class ObjectAction extends ComponentAction<object> {}
		class BehaviourAction extends ComponentAction<object> {}

		let count = 0;
		const sceneModel = factory.model.createAndResolveReferences(SceneModel, {
			gid: 'scene',
			triggers: [{
				event: { name: SceneEvent.name },
				action: { target: { gid: 'obj' }, name: ObjectAction.name }
			}], // from here to another
			children: [
				factory.model.create(ObjectModel, {
					gid: 'obj',
					triggers: [{
						event: {source: {gid: 'bvr'}, name: BehaviourEvent.name },
						action: {target: {gid:'scene'}, name: SceneAction.name }
					}], // from another to another
					behaviours: [
						factory.model.create(BehaviourModel, {
							gid: 'bvr',
							triggers: [{
								event: {source: {gid:'obj'}, name: ObjectEvent.name},
								action: {name: BehaviourAction.name}
							}] // from another to here
						})
					]
				})
			]
		});
		const scene = factory.component.createAndResolveReferences(sceneModel, SceneComponent);

		const object = factory.component.registry.byGid('obj');
		const behaviour = factory.component.registry.byGid('bvr');

		if(!object || !behaviour) {
			throw new Error("Objects were not retrieved correctly from Registry.");
		}

		scene.actions.$action(SceneAction).on(()=>{
			assert.ok(true, "SceneAction fired.");
			count++;
		});
		object.actions.$action(ObjectAction).on(()=>{
			assert.ok(true, "ObjectAction fired.");
			count++;
		});
		behaviour.actions.$action(BehaviourAction).on(()=>{
			assert.ok(true, "BehaviourAction fired. ");
			count++;
		});

		scene.start(); // start event listeners

		scene.events.$fire(new SceneEvent(scene));
		object.events.$fire(new ObjectEvent(object));
		behaviour.events.$fire(new BehaviourEvent(behaviour));

		assert.equal(count, 3, "All 3 actions triggered.");
		done();
	});
	it('can change event and action at runtime.', done => {
		const factory = new Factory();
		const sceneModel = factory.model.create(SceneModel, {
			children: [
				factory.model.create(ObjectModel, {
					gid: 'foo',
					triggers: [
						factory.model.create(TriggerModel, {
							gid: 'trigger',
							event: {
								source: {gid: 'bar'},
								name: BarEvent.name
							},
							action: {
								name: FooAction.name
							}
						})
					]
				}),
				factory.model.create(ObjectModel, {
					gid: 'bar'
				})
			]
		}, true);
		const scene = factory.component.createAndResolveReferences(sceneModel, SceneComponent);
		const foo = factory.component.registry.byGid('foo');
		const bar = factory.component.registry.byGid('bar');
		const triggerComponent = factory.component.registry.byGid<TriggerComponent>('trigger');

		if(!foo || !bar || !triggerComponent) {
			throw new Error("Objects were not retrieved correctly from Registry.");
		}

		foo.events.$event(FooEvent);
		bar.events.$event(BarEvent);

		let actionShouldBeCalled = 'foo';
		let count = 0;
		foo.actions.$action(FooAction).on(()=>{
			assert.ok(actionShouldBeCalled === 'foo', "Foo action was called correctly");
			count++;
		});
		bar.actions.$action(BarAction).on(()=>{
			assert.ok(actionShouldBeCalled === 'bar', "Bar action was called correctly");
			count++;
		});

		scene.start(); // start watchers and listeners

		// BarEvent should trigger FooAction
		bar.events.$fire(new BarEvent(bar));

		const triggerModel = factory.model.registry.byGid('trigger');
		if(!(triggerModel instanceof TriggerModel)) {
			throw new Error("Unexpected value for triggerModel");
		}

		// Set new event and target
		triggerModel.event.source = undefined; // will resolve to Foo
		triggerModel.event.name = FooEvent.name;
		triggerModel.action.target = factory.model.registry.byGid('bar');
		triggerModel.action.name = BarAction.name;

		actionShouldBeCalled = 'bar';

		// FooEvent should trigger BarAction
		foo.events.$fire(new FooEvent(foo));

		assert.equal(count, 2, "The right number of actions was executed");
		done();
	});
});
