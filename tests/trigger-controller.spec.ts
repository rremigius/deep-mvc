import {assert} from 'chai';
import {describe} from 'mocha';
import {MozelFactory} from "mozel";
import TriggerController from "@/Engine/controllers/TriggerController";
import ControllerFactory from "@/Controller/ControllerFactory";
import {Container} from "inversify";
import SceneModel from "@/Engine/models/SceneModel";
import ObjectModel from "@/Engine/models/ObjectModel";
import SceneController from "@/Engine/controllers/SceneController";
import "@/Engine/controllers/all";
import "@/Engine/views/headless/all";
import RenderFactory from "@/Engine/views/ViewFactory";
import ActionModel from "@/Engine/models/ActionModel";
import TriggerModel from "@/Engine/models/TriggerModel";
import BehaviourModel from "@/Engine/models/BehaviourModel";
import BehaviourController from "@/Engine/controllers/BehaviourController";
import {ControllerAction, ControllerEvent} from "@/Controller";
import headlessContainer from "@/Engine/views/headless/dependencies";
import ConditionEqualsModel from "@/Engine/models/ConditionModel/ConditionEqualsModel";
import {IEngineSymbol} from "@/Engine/IEngine";
import BaseEngine from "@/Engine/BaseEngine";

class Factory {
	model:MozelFactory;
	controller:ControllerFactory;

	constructor(config?:{modelContainer?:Container, controllerContainer?:Container}) {
		this.model = new MozelFactory(config && config.modelContainer);

		const controllerContainer = new Container({autoBindInjectable: true});
		if(config) {
			controllerContainer.parent = controllerContainer
		}
		controllerContainer.bind(RenderFactory).toConstantValue(new RenderFactory(headlessContainer));
		controllerContainer.bind(IEngineSymbol).toConstantValue(new BaseEngine());
		this.controller = new ControllerFactory(controllerContainer);
	}
}

class FooEvent extends ControllerEvent<{foo:string}> {}
class FooAction extends ControllerAction<{foo:string}> {}
class BarEvent extends ControllerEvent<{bar:string}> {}
class BarAction extends ControllerAction<{bar:string}> {}

describe('TriggerController', () => {
	it('listens to an event on source Behaviour and calls an action on its target Behaviour', done => {
		const factory = new Factory();

		const fooModel = factory.model.create<BehaviourModel>(BehaviourModel, {gid: 'fooBehaviour'});
		const barModel = factory.model.create<BehaviourModel>(BehaviourModel, {gid: 'barBehaviour'});

		const triggerModel = factory.model.create<TriggerModel<FooEvent, BarAction>>(TriggerModel, {
			event: {
				name: FooEvent.name,
				source: {gid: 'fooBehaviour'},
			},
			action: {
				name: BarAction.name,
				target: {gid: 'barBehaviour'}
			},
			mapping: {bar: "foo"}
		}, true);

		const expected = 'bar';

		const foo = factory.controller.createAndResolveReferences(fooModel, BehaviourController);
		const bar = factory.controller.createAndResolveReferences(barModel, BehaviourController);

		foo.actions.$action(BarAction).on(() => {
			assert.ok(false, "BarAction on Foo was avoided");
		});
		bar.actions.$action(BarAction).on(action => {
			assert.deepEqual(action && action.data.bar, expected, "BarAction on Bar called with correct data");
			done();
		});

		const trigger = factory.controller.createAndResolveReferences(triggerModel, TriggerController);
		trigger.start();

		foo.events.$fire(FooEvent, new FooEvent(foo, {foo: expected}));
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

		// Create Controllers
		const behaviourCtl = factory.controller.create(barBehaviourModel, BehaviourController);
		behaviourCtl.actions.$action(BarAction).on(received => {
			assert.equal(received && received.data.bar, expected);
			done();
		});

		const triggerCtl = factory.controller.createAndResolveReferences(triggerModel, TriggerController);
		triggerCtl.start();

		const eventBus = triggerCtl.eventBus;
		eventBus.$fire(FooEvent, new FooEvent(undefined, { foo: expected }));
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

		const foo = factory.controller.create(fooModel, BehaviourController);
		const negative = factory.controller.create(negativeModel, BehaviourController);
		const positive = factory.controller.create(positiveModel, BehaviourController);

		negative.actions.$action(BarAction).on(() => {
			assert.ok(false, "Non-matching trigger did not call target action.");
		});
		positive.actions.$action(BarAction).on(() => {
			assert.ok(true, "Matching trigger called target action.");
			done();
		});

		const negativeTrigger = factory.controller.createAndResolveReferences(negativeTriggerModel);
		const positiveTrigger = factory.controller.createAndResolveReferences(positiveTriggerModel);

		negativeTrigger.start();
		positiveTrigger.start();

		foo.events.$fire(FooEvent, new FooEvent(undefined, {foo: correctValue}));
	});
	it('with default controller uses that controller for actions and events if no behaviour specified.', done=>{
		const factory = new Factory();
		const model = factory.model.create(BehaviourModel);
		const controller = factory.controller.create(model, BehaviourController);
		controller.actions.$action(BarAction).on(() => {
			assert.ok(true, "Action called on default controller.");
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
		const triggerController = factory.controller.create(triggerModel, TriggerController);
		triggerController.setDefaultController(controller);
		triggerController.start();

		controller.events.$fire(FooEvent, new FooEvent(controller, {foo: 'bar'}));
	});
	it('can be used on SceneController, ObjectController and BehaviourController.', done=>{
		const factory = new Factory();

		class SceneEvent extends ControllerEvent<object> {}
		class ObjectEvent extends ControllerEvent<object> {}
		class BehaviourEvent extends ControllerEvent<object> {}
		class SceneAction extends ControllerAction<object> {}
		class ObjectAction extends ControllerAction<object> {}
		class BehaviourAction extends ControllerAction<object> {}

		let count = 0;
		const sceneModel = factory.model.create(SceneModel, {
			gid: 'scene',
			triggers: [{
				event: { name: SceneEvent.name },
				action: { target: { gid: 'obj' }, name: ObjectAction.name }
			}], // from here to another
			objects: [
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
		}, true);
		const scene = factory.controller.createAndResolveReferences(sceneModel, SceneController);

		const object = factory.controller.registry.byGid('obj');
		const behaviour = factory.controller.registry.byGid('bvr');

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

		scene.events.$fire(SceneEvent, new SceneEvent(scene));
		object.events.$fire(ObjectEvent, new ObjectEvent(object));
		behaviour.events.$fire(BehaviourEvent, new BehaviourEvent(behaviour));

		assert.equal(count, 3, "All 3 actions triggered.");
		done();
	});
	it('can change event and action at runtime.', done => {
		const factory = new Factory();
		const sceneModel = factory.model.create(SceneModel, {
			objects: [
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
		const scene = factory.controller.createAndResolveReferences(sceneModel, SceneController);
		const foo = factory.controller.registry.byGid('foo');
		const bar = factory.controller.registry.byGid('bar');
		const triggerController = factory.controller.registry.byGid<TriggerController>('trigger');

		if(!foo || !bar || !triggerController) {
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
		bar.events.$fire(BarEvent, new BarEvent(bar));

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
		foo.events.$fire(FooEvent, new FooEvent(foo));

		assert.equal(count, 2, "The right number of actions was executed");
		done();
	});
});
