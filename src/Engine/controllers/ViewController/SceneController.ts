import {controllers} from "@/Controller";
import ControllerModel from "@/ControllerModel";
import ObjectController from "@/Engine/controllers/ViewController/ObjectController";
import SceneModel from "@/Engine/models/SceneModel";
import TriggerController from "../TriggerController";
import ControllerList from "@/Controller/ControllerList";
import {schema} from "mozel";
import ViewController from "@/Controller/ViewController";
import ISceneView, {ISceneViewSymbol} from "@/Engine/views/common/ISceneView";

export default class SceneController extends ViewController {
	static ModelClass = SceneModel;
	static ViewInterface = ISceneViewSymbol;

	model!:SceneModel;
	get view() { return super.view as ISceneView };

	@controllers(schema(SceneModel).triggers, TriggerController)
	triggers!:ControllerList<TriggerController>;

	init(model:ControllerModel) {
		super.init(model);

		this.triggers.events.added.on(event => event.controller.setDefaultController(this));
		this.triggers.events.removed.on(event => event.controller.setDefaultController(undefined));
	}
}
