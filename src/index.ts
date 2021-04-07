import {MozelFactory} from "mozel";
import EngineModel from "@/Engine/models/EngineModel";
import CameraModel from "@/Engine/models/ObjectModel/CameraModel";
import "@/Engine/controllers/all";
import "@/Engine/views/threejs/all";
import PlainEngine from "@/Engine/PlainEngine";
import Model3DModel from "@/Engine/models/ObjectModel/Model3DModel";

const models = new MozelFactory();
const model = models.create(EngineModel, {
	camera: {gid: 'camera'},
	scene: {
		marker: 'data-nft/pinball',
		children: [
			models.create(CameraModel, {gid: 'camera'}),
			models.create(Model3DModel, {
				files: [{url: 'assets/models/vw'}]
			})
		]
	}
})
const engine = new PlainEngine(model);

const container = document.getElementById('engine');
if(!container) throw new Error("No element found with id 'engine'.");
engine.attach(container);

engine.start();
