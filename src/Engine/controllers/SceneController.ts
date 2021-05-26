import {components} from "@/Component";
import ComponentModel from "@/ComponentModel";
import SceneModel from "@/Engine/models/SceneModel";
import TriggerController from "@/Engine/controllers/TriggerController";
import ComponentList from "@/Component/ComponentList";
import {schema} from "mozel";
import ViewController from "@/Controller/ViewController";

export default class SceneController extends ViewController {
	static Model = SceneModel;
	model!:SceneModel;

	@components(schema(SceneModel).children, ViewController)
	children!:ComponentList<ViewController>;

	@components(schema(SceneModel).triggers, TriggerController)
	triggers!:ComponentList<TriggerController>;

	onInit() {
		super.onInit();

		this.triggers.events.added.on(event => event.component.setDefaultController(this));
		this.triggers.events.removed.on(event => event.component.setDefaultController(undefined));
	}
}
