import Controller, {injectableController} from "@/Controller";
import ControllerModel from "@/models/ControllerModel";
import ObjectController from "@/Controller/ObjectController";
import SceneModel from "@/models/SceneModel";
import TriggerController from "./TriggerController";
import ControllerRootRenderInterface from "@/renderers/common/ObjectRenderInterface/ControllerRootRenderInterface";
import ControllerList from "@/Controller/ControllerList";

@injectableController()
export default class SceneController extends Controller {
	static ModelClass = SceneModel;

	objects!:ControllerList<ObjectController>; // will be set on init
	triggers!:ControllerList<TriggerController>; // will be set on init

	private _root!:ControllerRootRenderInterface<unknown>;
	get root() { return this._root; }
	get xrScene() { return <SceneModel>this.model; }

	init(model:ControllerModel) {
		super.init(model);

		this._root = this.renderFactory.create<ControllerRootRenderInterface<unknown>>("RootObjectRenderInterface");

		// Setup objects list
		this.objects = new ControllerList<ObjectController>(); // create it manually so we can add event listeners
		this.objects.events.added.on(event => this.onObjectAdded(event.controller));
		this.objects.events.removed.on(event => this.onObjectRemoved(event.controller));
		this.setupControllerList(this.objects, this.xrScene.objects, ObjectController);

		// Create triggers
		this.triggers = this.createControllerList(this.xrScene.triggers, TriggerController);
		this.triggers.each(trigger => trigger.setDefaultController(this));
	}

	onObjectAdded(xrObjectController:ObjectController) {
		this.root.add(xrObjectController.root);
	}

	onObjectRemoved(xrObjectController:ObjectController) {
		this.root.remove(xrObjectController.root);
	}
}
