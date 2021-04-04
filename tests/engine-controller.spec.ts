import EngineController from "@/Engine/controllers/EngineController";
import EngineModel from "@/Engine/models/EngineModel";
import ViewModel from "@/ViewModel";
import {assert} from "chai";
import "@/Engine/views/headless/all";
import {MozelFactory} from "mozel";

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
		const engine = EngineController.create(model);
		const engineDependency = engine.registry.byGid('foo')!.dependencies.get<EngineController>(EngineController);
		assert.equal(engineDependency, engine, "EngineController retrieved from hierarchy.");
	});
});
