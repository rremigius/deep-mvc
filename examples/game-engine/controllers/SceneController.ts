import {components} from "@/Component";
import SceneModel from "@examples/game-engine/models/SceneModel";
import TriggerController from "@examples/game-engine/controllers/TriggerController";
import ComponentList from "@/Component/ComponentList";
import {schema} from "mozel";
import ViewController from "@/Controller/ViewController";
import ObjectController from "@examples/game-engine/controllers/ObjectController";

export default class SceneController extends ViewController {
	static Model = SceneModel;
	model!:SceneModel;

	@components(schema(SceneController.Model).objects, ObjectController)
	objects!:ComponentList<ViewController>; // more generic because we cannot override the type

	@components(schema(SceneController.Model).triggers, TriggerController)
	triggers!:ComponentList<TriggerController>;

	onInit() {
		super.onInit();

		this.triggers.events.add.on(event => event.component.setDefaultController(this));
		this.triggers.events.remove.on(event => event.component.setDefaultController(undefined));
	}
}
