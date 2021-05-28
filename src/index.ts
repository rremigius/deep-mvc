import EngineModel from "@/Engine/models/EngineModel";
import CameraModel from "@/Engine/models/ObjectModel/CameraModel";
import PlainEngine from "@/Engine/PlainEngine";
import EngineModelFactory from "@/Engine/models/EngineModelFactory";
import LightModel from "@/Engine/models/ObjectModel/LightModel";
import Model3DModel from "@/Engine/models/ObjectModel/Model3DModel";
import OrbitControlsModel from "@/Engine/models/ObjectModel/CameraModel/OrbitControlsModel";
import TweenBehaviourModel from "@/Engine/models/BehaviourModel/TweenBehaviourModel";
import Log from "@/log";
import ImageModel from "@/Engine/models/ObjectModel/ImageModel";
import VideoModel from "@/Engine/models/ObjectModel/VideoModel";

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
			models.create(VideoModel, {
				gid: 'video',
				file: {url: 'assets/videos/cat01.mp4'},
				scale: 0.5,
				position: {z: 0.5},
				behaviours: [models.create(TweenBehaviourModel, {
					gid: 'tween',
					steps: [{
						gid: 'step',
						path: 'position',
						to: {x: -2},
						duration: 5,
						ease: "Sine.easeInOut"
					}],
					yoyo: true
				})]
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

setTimeout(() => {
	const video = models.registry.byGid<VideoModel>('video');
	video!.file!.url = 'assets/videos/cat02.mp4';
},2000);
