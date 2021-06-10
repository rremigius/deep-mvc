import EngineModel from "@examples/game-engine/models/EngineModel";
import CameraModel from "@examples/game-engine/models/ObjectModel/CameraModel";
import EngineModelFactory from "@examples/game-engine/models/EngineModelFactory";
import LightModel from "@examples/game-engine/models/ObjectModel/LightModel";
import Model3DModel from "@examples/game-engine/models/ObjectModel/Model3DModel";
import OrbitControlsModel from "@examples/game-engine/models/ObjectModel/CameraModel/OrbitControlsModel";
import Log from "@/log";
import {ViewClickEvent} from "@/View";
import Component from "@/Component";
import ComponentFactory from "@/Component/ComponentFactory";
import BehaviourController from "@examples/game-engine/controllers/BehaviourController";
import BehaviourModel from "@examples/game-engine/models/BehaviourModel";
import EventListener from "@/EventListener";
import Engine from "@examples/game-engine/Engine";
import ThreeViewFactory from "@examples/game-engine/views/threejs/ThreeViewFactory";
import UIFactory from "@examples/game-engine/views/ui/UIFactory";
import ReactDOM from 'react-dom';
import App from "@examples/game-engine/App";
import SphereModel from "./models/ObjectModel/SphereModel";
import ObjectController from "./controllers/ObjectController";

const log = Log.instance("index");
const models = new EngineModelFactory();

class ClickToDisableBehaviourModel extends BehaviourModel {
	static get type() { return 'ClickToDisable' }
}
class ClickToDisableBehaviourController extends BehaviourController {
	static Model = ClickToDisableBehaviourModel;
	model!:ClickToDisableBehaviourModel;

	parentListener?:EventListener<ViewClickEvent>;

	onSetParent(parent?: Component) {
		super.onSetParent(parent);
		// Stop current listener
		if(this.parentListener) {
			this.parentListener.stop();
		}
		// Start new listener
		if(parent instanceof ObjectController) {
			this.parentListener = this.listenTo(parent.events.click, event => {
				parent.enable(false);
			});
		}
	}
}

const model = models.createAndResolveReferences(EngineModel, {
	gid: 'engine',
	camera: {gid: 'camera'},
	scene: {
		gid: 'scene',
		description: 'foo',
		marker: 'data-nft/pinball',
		objects: [
			models.create(LightModel, {gid: 'light'}),
			models.create(CameraModel, {
				gid: 'camera',
				position: {z: 5},
				behaviours: [models.create(OrbitControlsModel, {
					maxDistance: 10,
					minDistance: 2,
					enableZoom: true,
					rotateSpeed: 0.5,
					maxPolarAngle: 1.5
				})]
			}),
			models.create(Model3DModel, {
				gid: 'vw',
				files: [{url: 'assets/models/vw/model.dae'}],
				scale: 0.5,
				position: {z: 0.5, x: 2},
				behaviours: [
					models.create(ClickToDisableBehaviourModel)
				],
				objects: []
			}),
			models.create(SphereModel, {
				gid: 'sphere',
				radius: 0.2
			})
		]
	}
});
class MyEngine extends Engine {
	createComponentFactories(): Record<string, ComponentFactory> {
		const controllerFactory = Engine.createDefaultControllerFactory();
		controllerFactory.register(ClickToDisableBehaviourController);

		const viewFactory = new ThreeViewFactory();
		viewFactory.setControllerRegistry(controllerFactory.registry);

		const uiFactory = new UIFactory();
		uiFactory.setControllerRegistry(controllerFactory.registry);

		return {
			controller: controllerFactory,
			view: viewFactory,
			ui: uiFactory
		}
	}
}
const engine = new MyEngine(model);

const container = document.getElementById('engine');
if(!container) throw new Error("No element found with id 'engine'.");

ReactDOM.render(<App engine={engine}/>, container);

document.addEventListener('keyup', () => {
	if(!engine.isLoaded) {
		log.info("Engine not loaded yet. Cannot start.");
		return;
	}
	if(!engine.isStarted) {
		engine.start();
		setTimeout(()=>{
			const sphere = models.registry.byGid<SphereModel>('sphere');
			const vw = models.registry.byGid<LightModel>('vw');

			vw!.objects.add(sphere as SphereModel);
			console.log(model);
			console.log(engine.getRootComponent('view').toTree());
			console.log(engine.getRootComponent('ui').toTree());
		},2000);
	} else if(engine.isRunning) {
		engine.pause();
	} else {
		engine.resume();
	}
});
