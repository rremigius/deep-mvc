import EngineController from "@/Engine/controllers/ViewController/EngineController";
import EngineModel from "@/Engine/models/EngineModel";
import ViewModel from "@/ViewModel";
import {assert} from "chai";
import {MozelFactory} from "mozel";
import HeadlessViewFactory from "../src/Engine/views/headless/HeadlessViewFactory";
import EngineControllerFactory from "../src/Engine/controllers/EngineControllerFactory";

describe("EngineController", () => {
	it("subcontrollers can access EngineController from dependencies", () => {
		const models = new MozelFactory();
		const model = models.create(EngineModel, {
			scene: {
				children: [ViewModel.create<ViewModel>({
					gid: 'foo'
				})]
			}
		});
		const viewFactory = new HeadlessViewFactory();
		const controllers = new EngineControllerFactory(viewFactory);
		const engine = controllers.createAndResolveReferences(model, EngineController);
		const engineDependency = controllers.registry.byGid('foo')!.dependencies.get<EngineController>(EngineController);
		assert.equal(engineDependency, engine, "EngineController retrieved from hierarchy.");
	});
});
