import EngineController from "@/Engine/controllers/EngineController";
import EngineModel from "@/Engine/models/EngineModel";
import ViewModel from "@/ViewModel";
import {assert} from "chai";
import "@/Engine/views/headless/all";
import {MozelFactory} from "mozel";
import ControllerFactory from "@/Controller/ControllerFactory";
import headlessViewDependencies from "@/Engine/views/headless/dependencies";
import ViewFactory from "@/Engine/views/ViewFactory";
import {createDependencyContainer as createControllerDependencies} from "@/Controller/dependencies";

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
		const controllers = new ControllerFactory(createControllerDependencies(), new ViewFactory(headlessViewDependencies));
		const engine = controllers.createAndResolveReferences(model, EngineController);
		const engineDependency = controllers.registry.byGid('foo')!.dependencies.get<EngineController>(EngineController);
		assert.equal(engineDependency, engine, "EngineController retrieved from hierarchy.");
	});
});
