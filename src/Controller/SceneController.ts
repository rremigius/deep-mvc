import Controller, {injectable} from "@/Controller";
import ControllerModel from "@/models/ControllerModel";
import ObjectController from "@/Controller/ObjectController";
import SceneModel from "@/models/SceneModel";
import TriggerController from "./TriggerController";
import RootObjectRender from "@/renderers/common/ObjectRenderInterface/RootObjectRenderInterface";
import ControllerList from "@/Controller/ControllerList";

@injectable()
export default class SceneController extends Controller {
	static ModelClass = SceneModel;

	objects!:ControllerList<ObjectController>; // will be set on init
	triggers!:ControllerList<TriggerController>; // will be set on init

	private _root!:RootObjectRender;
	get root() { return this._root; }

	model!:SceneModel; // TS: initialized in super constructor

	init(model:ControllerModel) {
		super.init(model);

		this._root = this.renderFactory.create<RootObjectRender>("RootObjectRenderInterface");

		// Create objects
		this.objects = this.controllers(this.model.$property('objects'), ObjectController, objects => {
			this.objects = objects
			this.objects.events.added.on(event => this.onObjectAdded(event.controller));
			this.objects.events.removed.on(event => this.onObjectRemoved(event.controller));
		}).get();

		// Create triggers
		this.triggers = this.controllers(this.model.$property('triggers'), TriggerController, triggers => {
			this.triggers = triggers;
			this.triggers.each(trigger => trigger.setDefaultController(this));
		}).get();
	}

	onObjectAdded(xrObjectController:ObjectController) {
		this.root.add(xrObjectController.root);
	}

	onObjectRemoved(xrObjectController:ObjectController) {
		this.root.remove(xrObjectController.root);
	}
}
