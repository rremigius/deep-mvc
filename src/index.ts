import EngineModel from "@/Engine/models/EngineModel";
import CameraModel from "@/Engine/models/ObjectModel/CameraModel";
import PlainEngine from "@/Engine/PlainEngine";
import EngineModelFactory from "@/Engine/models/EngineModelFactory";
import LightModel from "@/Engine/models/ObjectModel/LightModel";
import GraphModel from "@/Engine/models/ObjectModel/GraphModel";

const models = new EngineModelFactory();
const model = models.createAndResolveReferences(EngineModel, {
	camera: {gid: 'camera', position: {z: 5}},
	scene: {
		marker: 'data-nft/pinball',
		children: [
			models.create(LightModel),
			models.create(CameraModel, {
				gid: 'camera',
				position: {z: 2},
				controls: {
					maxDistance: 4,
					minDistance: 2,
					enableZoom: true,
					rotateSpeed: 0.5,
					// maxPolarAngle: 1.5
				}
			}),
			// models.create(Model3DModel, {
			// 	files: [{url: 'assets/models/vw/model.dae'}],
			// 	scale: 0.5,
			// 	position: {z: 0.5},
			// 	behaviours: [models.create(TweenBehaviourModel, {
			// 		gid: 'tween',
			// 		steps: [{
			// 			gid: 'step',
			// 			path: 'position',
			// 			to: {x: -5},
			// 			duration: 5,
			// 			ease: "Sine.easeInOut"
			// 		}],
			// 		yoyo: true
			// 	})]
			// }),
			models.create(GraphModel, {
				nodes: [
					{gid: "foo", label: "Foo", color: "red"},
					{gid: "bar", label: "Bar", color: "blue"},
					{gid: "qux", label: "Qux", color: "green"}
				],
				links: [
					{from: {gid: "foo"}, to: {gid: "bar"}}
				]
			})
		]
	}
});
const engine = new PlainEngine(model);

const container = document.getElementById('engine');
if(!container) throw new Error("No element found with id 'engine'.");
engine.attach(container);

(async () => {
	await engine.loading;
	engine.start();
})()
