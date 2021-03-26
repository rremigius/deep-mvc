import Controller, {controllers, injectable} from "@/Controller";
import ControllerModel from "@/ControllerModel";
import ObjectController from "@/Engine/controllers/ObjectController";
import SceneModel from "@/Engine/models/SceneModel";
import TriggerController from "./TriggerController";
import RootObjectView from "@/Engine/views/common/IObjectView/IRootObjectView";
import ControllerList from "@/Controller/ControllerList";
import {schema} from "mozel";
import XRController from "@/Engine/XRController";

@injectable()
export default class SceneController extends XRController {
	static ModelClass = SceneModel;
	model!:SceneModel;

	@controllers(schema(SceneModel).objects, ObjectController)
	objects!:ControllerList<ObjectController>;
	@controllers(schema(SceneModel).triggers, TriggerController)
	triggers!:ControllerList<TriggerController>;

	private _root!:RootObjectView;
	get root() { return this._root; }

	init(model:ControllerModel) {
		super.init(model);
		this._root = this.viewFactory.create<RootObjectView>("IRootObjectView");

		this.objects.events.added.on(event => this.onObjectAdded(event.controller));
		this.objects.events.removed.on(event => this.onObjectRemoved(event.controller));

		this.triggers.events.added.on(event => event.controller.setDefaultController(this));
		this.triggers.events.removed.on(event => event.controller.setDefaultController(undefined));
	}

	onObjectAdded(objectController:ObjectController) {
		this.root.add(objectController.root);
	}

	onObjectRemoved(objectController:ObjectController) {
		this.root.remove(objectController.root);
	}
}
