import EngineModel from "@/Engine/models/EngineModel";
import CameraModel from "@/Engine/models/ObjectModel/CameraModel";
import EngineModelFactory from "@/Engine/models/EngineModelFactory";
import LightModel from "@/Engine/models/ObjectModel/LightModel";
import Model3DModel from "@/Engine/models/ObjectModel/Model3DModel";
import OrbitControlsModel from "@/Engine/models/ObjectModel/CameraModel/OrbitControlsModel";
import Log from "@/log";
import {ViewClickEvent} from "@/View";
import Component from "@/Component";
import ComponentFactory from "@/Component/ComponentFactory";
import BehaviourController from "@/Engine/controllers/BehaviourController";
import BehaviourModel from "@/Engine/models/BehaviourModel";
import ViewController from "@/Controller/ViewController";
import EventListener from "@/EventListener";
import Engine from "@/Engine/Engine";
import ThreeViewFactory from "@/Engine/views/threejs/ThreeViewFactory";
import UIFactory from "@/Engine/views/ui/UIFactory";
import SceneModel from "@/Engine/models/SceneModel";
import ReactDOM from 'react-dom';
import App from "@/Engine/App";

const log = Log.instance("index");
const models = new EngineModelFactory();

class ClickToDisableBehaviourModel extends BehaviourModel {
	static get type() { return 'ClickToDisable' }
}
class ClickToDisableBehaviourController extends BehaviourController {
	static Model = ClickToDisableBehaviourModel;
	model!:ClickToDisableBehaviourModel;

	parentListener?:EventListener<ViewClickEvent>;

	setParent(parent?: Component) {
		super.setParent(parent);
		// Stop current listener
		if(this.parentListener) {
			this.parentListener.stop();
		}
		// Start new listener
		if(parent instanceof ViewController) {
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
		children: [
			models.create(LightModel),
			models.create(CameraModel, {
				gid: 'camera',
				position: {z: 2},
				behaviours: [models.create(OrbitControlsModel, {
					maxDistance: 4,
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
				position: {z: 0.5},
				behaviours: [
					models.create(ClickToDisableBehaviourModel)
				]
			})
		]
	}
});
class MyEngine extends Engine {
	createComponentFactories(): Record<string, ComponentFactory> {
		const controllerFactory = Engine.createDefaultControllerFactory();
		const viewFactory = new ThreeViewFactory(controllerFactory.registry);
		viewFactory.register(ClickToDisableBehaviourController)
		const uiFactory = new UIFactory(controllerFactory.registry);
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
		const scene = models.registry.byGid<SceneModel>('scene');
		scene!.description = 'bar';
	} else if(engine.isRunning) {
		engine.pause();
	} else {
		engine.resume();
	}
});
