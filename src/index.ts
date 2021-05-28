import EngineModel from "@/Engine/models/EngineModel";
import CameraModel from "@/Engine/models/ObjectModel/CameraModel";
import PlainEngine from "@/Engine/PlainEngine";
import EngineModelFactory from "@/Engine/models/EngineModelFactory";
import LightModel from "@/Engine/models/ObjectModel/LightModel";
import Model3DModel from "@/Engine/models/ObjectModel/Model3DModel";
import OrbitControlsModel from "@/Engine/models/ObjectModel/CameraModel/OrbitControlsModel";
import Log from "@/log";
import {ViewClickEvent} from "@/View";
import {ComponentEnableAction} from "@/Component";

const log = Log.instance("index");
const models = new EngineModelFactory();

const model = models.createAndResolveReferences(EngineModel, {
	camera: {gid: 'camera'},
	scene: {
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
				gid: 'cat',
				files: [{url: 'assets/models/cat/cat.obj'}, {url: 'assets/models/cat/cat.mtl'}],
				scale: 0.1,
				position: {z: 0.5},
				triggers: [{
					event: { name: ViewClickEvent.name },
					action: {
						name: ComponentEnableAction.name,
						target: {gid: 'vw'},
						input: { enable: true }
					}
				},{
					event: { name: ViewClickEvent.name },
					action: {
						name: ComponentEnableAction.name,
						input: { enable: false }
					}
				}]
			}),
			models.create(Model3DModel, {
				gid: 'vw',
				enabled: false,
				files: [{url: 'assets/models/vw/model.dae'}],
				scale: 0.5,
				position: {z: 0.5},
				triggers: [{
					event: { name: ViewClickEvent.name },
					action: {
						name: ComponentEnableAction.name,
						target: {gid: 'cat'},
						input: { enable: true }
					}
				},{
					event: { name: ViewClickEvent.name },
					action: {
						name: ComponentEnableAction.name,
						input: { enable: false }
					}
				}]
			})
		]
	}
});
const engine = new PlainEngine(model);

const container = document.getElementById('engine');
if(!container) throw new Error("No element found with id 'engine'.");
engine.attach(container);
document.addEventListener('keyup', () => {
	if(!engine.isLoaded) {
		log.info("Engine not loaded yet. Cannot start.");
		return;
	}
	if(!engine.isStarted) {
		engine.start();
	} else if(engine.isRunning) {
		engine.pause();
	} else {
		engine.resume();
	}
});
