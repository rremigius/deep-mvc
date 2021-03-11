import {assert} from 'chai';
import {describe} from 'mocha';
import EngineInterface from "@/Engine/EngineInterface";
import {FrameListener} from "@/Engine";
import {MozelFactory} from "mozel";
import TriggerController from "@/Controller/TriggerController";
import ControllerFactory from "@/Controller/ControllerFactory";
import {Container} from "inversify";
import CameraRenderInterface from "@/renderers/common/ObjectRenderInterface/CameraRenderInterface";
import ThreeCamera from "@/renderers/threejs/ThreeObject/ThreeCamera";
import EventInterface, {Callback, Event} from "event-interface-mixin";
import SceneModel from "@/models/SceneModel";
import ObjectModel from "@/models/ObjectModel";
import SceneController from "@/Controller/SceneController";
import "@/Controller/all";
import "@/renderers/threejs/all";
import threeContainer from "@/renderers/threejs/inversify";
import RenderFactory from "@/renderers/RenderFactory";
import ActionModel from "@/models/ActionModel";
import TriggerModel from "@/models/TriggerModel";
import ConditionModel from "@/models/ConditionModel";
import BehaviourModel from "@/models/BehaviourModel";
import BehaviourController from "@/Controller/BehaviourController";
import {Action} from "@/Controller";

class MockEngine implements EngineInterface {
	camera:CameraRenderInterface<unknown> = new ThreeCamera();
	addFrameListener(f:FrameListener) { };
	callAction(action: string, payload: unknown) { };
	removeFrameListener(f: FrameListener) { };
	eventInterface = new EventInterface();
	on = this.eventInterface.getOnMethod();
	off = this.eventInterface.getOffMethod();
	fire = this.eventInterface.getFireMethod();
}

class Factory {
	model:MozelFactory;
	controller:ControllerFactory;

	constructor(config?:{modelContainer?:Container, controllerContainer?:Container}) {
		this.model = new MozelFactory(config && config.modelContainer);

		const controllerContainer = new Container({autoBindInjectable: true});
		if(config) {
			controllerContainer.parent = controllerContainer
		}
		controllerContainer.bind(RenderFactory).toConstantValue(new RenderFactory(threeContainer));
		this.controller = new ControllerFactory(new MockEngine(), controllerContainer);
	}
}

class FooEvent extends Event<{foo:object}> {}
class BarAction extends Event<{bar:object}> {}

describe('TriggerController', () => {
	it('listens to an event on a Behaviour and calls an action on its target Behaviour', done => {
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

		const expected = {};

		const foo = factory.controller.create(BehaviourController, fooModel, true);
		const bar = factory.controller.create(BehaviourController, barModel, true);

		foo.registerAction(BarAction, () => {
			assert.ok(false, "BarAction on Foo was avoided");
		});
		bar.registerAction(BarAction, payload => {
			assert.deepEqual(payload && payload.data.bar, expected, "BarAction on Bar called with correct data");
			done();
		});

		const trigger = factory.controller.create(TriggerController, triggerModel, true);
		trigger.start();

		foo.fire(FooEvent, {foo: expected});
	});

	it('listens to an event on the EventBus if no source is provided on event model', done => {
		const factory = new Factory();

		// Create Models
		const barBehaviourModel = factory.model.create(BehaviourModel, {gid: 'barBehaviour'});

		const triggerModel = factory.model.create<TriggerModel<FooEvent, BarAction>>(TriggerModel, {
			gid: 'trigger',
			event: {
				name:FooEvent.name
			},
			action: factory.model.create(ActionModel, { // just to show that you can also mix Models with plain data
				target: barBehaviourModel,
				name: BarAction.name
			}),
			mapping: { bar: "foo"} // Try putting different values here :)
		});

		const expected = {};

		// Create Controllers
		const behaviourCtl = factory.controller.create(BehaviourController, barBehaviourModel, true);
		behaviourCtl.registerAction(BarAction, received => {
			assert.equal(received && received.data.bar, expected);
			done();
		});

		const triggerCtl = factory.controller.create(TriggerController, triggerModel, true);
		triggerCtl.start();

		const eventBus = triggerCtl.eventBus;
		eventBus.fire(FooEvent, { foo: expected });
	});
	it('with condition is not fired if condition is not met.', done=>{
		const factory = new Factory();
		const fooModel = factory.model.create(BehaviourModel, {gid: 'fooBehaviour'});

		const negativeModel = factory.model.create(BehaviourModel, {gid: 'negative'});
		const positiveModel = factory.model.create(BehaviourModel, {gid: 'positive'});

		const negativeTriggerModel = factory.model.create<TriggerModel<FooEvent, BarAction>>(TriggerModel, {
			event: { source: fooModel, name: FooEvent.name },
			action: { target: negativeModel, name: BarAction.name },
			condition: factory.model.create<ConditionModel<FooEvent>>(ConditionModel, {
				evaluator: ()=>false
			})
		});

		const positiveTriggerModel = factory.model.create<TriggerModel<FooEvent, BarAction>>(TriggerModel, {
			event: { source: fooModel, name: FooEvent.name },
			action: { target: positiveModel, name: BarAction.name },
			condition: factory.model.create<ConditionModel<FooEvent>>(ConditionModel, {
				evaluator: ()=>true
			})
		});

		const foo = factory.controller.create(BehaviourController, fooModel, true);
		const negative = factory.controller.create(BehaviourController, negativeModel, true);
		const positive = factory.controller.create(BehaviourController, positiveModel, true);

		negative.registerAction(BarAction, () => {
			assert.ok(false, "Non-matching trigger did not call target action.");
		});
		positive.registerAction(BarAction, () => {
			assert.ok(true, "Matching trigger called target action.");
			done();
		});

		const negativeTrigger = factory.controller.create(TriggerController, negativeTriggerModel, true);
		const positiveTrigger = factory.controller.create(TriggerController, positiveTriggerModel, true);

		negativeTrigger.start();
		positiveTrigger.start();

		foo.fire(FooEvent);
	});
	it('with default controller uses that controller for actions and events if no behaviour specified.', done=>{
		const factory = new Factory();
		const model = factory.model.create(BehaviourModel);
		const controller = factory.controller.create(BehaviourController, model);
		controller.registerAction(BarAction, () => {
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
		const triggerController = factory.controller.create(TriggerController, triggerModel);
		triggerController.setDefaultController(controller);
		triggerController.start();

		controller.fire(FooEvent);
	});
	it('can be used on SceneController, ObjectController and BehaviourController.', done=>{
		const factory = new Factory();

		class SceneEvent extends Event<void> {}
		class ObjectEvent extends Event<void> {}
		class BehaviourEvent extends Event<void> {}
		class SceneAction extends Action<void> {}
		class ObjectAction extends Action<void> {}
		class BehaviourAction extends Action<void> {}

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
						action: {target: {gid:'scene'}, name: BehaviourAction.name }
					}], // from another to another
					behaviours: [
						factory.model.create(BehaviourModel, {
							gid: 'bvr',
							triggers: [{
								event: {source: {gid:'obj'}, name: ObjectEvent.name},
								action: {name: SceneAction.name}
							}] // from another to here
						})
					]
				})
			]
		}, true);
		const scene = factory.controller.create(SceneController, sceneModel, true);

		const object = factory.controller.registry.byGid('obj');
		const behaviour = factory.controller.registry.byGid('bvr');

		if(!object || !behaviour) {
			throw new Error("Objects were not retrieved correctly from Registry.");
		}

		scene.registerAction(SceneAction, ()=>{
			assert.ok(true, "SceneAction fired.");
			count++;
		});
		object.registerAction(ObjectAction, ()=>{
			assert.ok(true, "ObjectAction fired.");
			count++;
		});
		behaviour.registerAction(BehaviourAction, ()=>{
			assert.ok(true, "BehaviourAction fired. ");
			count++;
		});

		scene.start(); // start event listeners

		scene.fire(SceneEvent);
		object.fire(ObjectEvent);
		behaviour.fire(BehaviourEvent);

		assert.equal(count, 3, "All 3 actions triggered.");
		done();
	});
	// it('can change event and action at runtime.', done => {
	// 	const factory = new Factory();
	// 	const sceneModel = factory.model.create(SceneModel, {
	// 		objects: [
	// 			factory.model.create(ObjectModel, {
	// 				gid: 'foo',
	// 				triggers: [
	// 					factory.model.create(TriggerModel, {
	// 						gid: 'trigger',
	// 						event: {
	// 							source: {gid: 'bar'},
	// 							name: 'barEvent'
	// 						},
	// 						action: {
	// 							name: 'fooAction'
	// 						}
	// 					})
	// 				]
	// 			}),
	// 			factory.model.create(ObjectModel, {
	// 				gid: 'bar'
	// 			}),
	// 			factory.model.create(ObjectModel, {
	// 				gid: 'qux'
	// 			})
	// 		]
	// 	}, true);
	// 	const scene = factory.controller.create(SceneController, sceneModel, true);
	// 	const foo = factory.controller.registry.byGid('foo');
	// 	const bar = factory.controller.registry.byGid('bar');
	// 	const qux = factory.controller.registry.byGid('qux');
	// 	const triggerController = factory.controller.registry.byGid<TriggerController>('trigger');
	//
	// 	if(!foo || !bar || !qux || !triggerController) {
	// 		throw new Error("Objects were not retrieved correctly from Registry.");
	// 	}
	//
	// 	let actionShouldBeCalled = 'foo';
	// 	let count = 0;
	// 	foo.registerAction('fooAction', ()=>{
	// 		assert.ok(actionShouldBeCalled === 'foo', "Foo action was called correctly");
	// 		count++;
	// 	});
	// 	bar.registerAction('barAction', ()=>{
	// 		assert.ok(actionShouldBeCalled === 'bar', "Bar action was called correctly");
	// 		count++;
	// 	});
	// 	qux.registerAction('barAction', ()=>{
	// 		assert.ok(actionShouldBeCalled === 'qux', "Qux action was called correctly");
	// 		count++;
	// 	});
	//
	// 	scene.start(); // start watchers and listeners
	//
	// 	foo.fireEvent('fooEvent');
	// 	bar.fireEvent('barEvent');
	//
	// 	const triggerModel = factory.model.registry.byGid('trigger');
	// 	if(!(triggerModel instanceof TriggerModel)) {
	// 		throw new Error("Unexpected value for triggerModel");
	// 	}
	//
	// 	triggerModel.event.source = undefined;
	// 	triggerModel.event.name = 'fooEvent';
	// 	triggerModel.action.target = factory.model.registry.byGid('bar');
	// 	triggerModel.action.name = 'barAction';
	//
	// 	actionShouldBeCalled = 'bar';
	//
	// 	foo.fireEvent('fooEvent');
	// 	bar.fireEvent('barEvent');
	//
	// 	triggerController.target.set(qux);
	// 	actionShouldBeCalled = 'qux';
	//
	// 	foo.fireEvent('fooEvent');
	//
	// 	assert.equal(count, 3, "The right number of actions was executed");
	// 	done();
	// });
});
