import ARjsEngine from "@/Engine/ARjsEngine";
import {MozelFactory} from "mozel";
import EngineModel from "@/Engine/models/EngineModel";
import CameraModel from "@/Engine/models/ObjectModel/CameraModel";
import "@/Engine/controllers/all";
import "@/Engine/views/headless/all";

const models = new MozelFactory();
const model = models.create(EngineModel, {
	camera: {gid: 'camera'},
	scene: {
		children: [
			models.create(CameraModel, {gid: 'camera'})
		]
	}
})
const engine = new ARjsEngine(model);

const container = document.getElementById('engine');
if(!container) throw new Error("No element found with id 'engine'.");
engine.attach(container);

engine.start();
