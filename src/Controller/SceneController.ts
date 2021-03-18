import Controller, {injectable} from "@/Controller";
import ControllerModel from "@/models/ControllerModel";
import ObjectController from "@/Controller/ObjectController";
import SceneModel from "@/models/SceneModel";
import TriggerController from "./TriggerController";
import RootObjectRender from "@/renderers/common/ObjectRenderInterface/RootObjectRenderInterface";

@injectable()
export default class SceneController extends Controller {
	static ModelClass = SceneModel;

	objects = this.controllers(this.model.$('objects'), ObjectController).init( objects => {
		objects.events.added.on(event => this.onObjectAdded(event.controller));
		objects.events.removed.on(event => this.onObjectRemoved(event.controller));
	});
	triggers = this.controllers(this.model.$('triggers'), TriggerController).init(triggers => {
		triggers.each(trigger => trigger.setDefaultController(this));
	});

	private _root!:RootObjectRender;
	get root() { return this._root; }

	model!:SceneModel; // TS: initialized in super constructor

	init(model:ControllerModel) {
		super.init(model);
		this._root = this.renderFactory.create<RootObjectRender>("RootObjectRenderInterface");
	}

	onObjectAdded(xrObjectController:ObjectController) {
		this.root.add(xrObjectController.root);
	}

	onObjectRemoved(xrObjectController:ObjectController) {
		this.root.remove(xrObjectController.root);
	}
}
