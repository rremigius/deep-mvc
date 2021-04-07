import EngineModel from "@/Engine/models/EngineModel";
import CameraModel from "@/Engine/models/ObjectModel/CameraModel";
import PlainEngine from "@/Engine/PlainEngine";
import Model3DModel from "@/Engine/models/ObjectModel/Model3DModel";
import EngineModelFactory from "@/Engine/models/EngineModelFactory";
import LightModel from "@/Engine/models/ObjectModel/LightModel";

const models = new EngineModelFactory();
const model = models.create(EngineModel, {
	camera: {gid: 'camera', position: {z: 5}},
	scene: {
		marker: 'data-nft/pinball',
		children: [
			models.create(LightModel),
			models.create(CameraModel, {gid: 'camera', position: {z: 2}}),
			models.create(Model3DModel, {
				files: [{url: 'assets/models/vw/model.dae'}],
				scale: 0.5,
				position: {z: 0.5}
			})
		]
	}
})
const engine = new PlainEngine(model);

const container = document.getElementById('engine');
if(!container) throw new Error("No element found with id 'engine'.");
engine.attach(container);

(async () => {
	await engine.loading;
	engine.start();
})()
