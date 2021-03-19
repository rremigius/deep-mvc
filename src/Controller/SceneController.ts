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

	objects!:ControllerList<ObjectController>;
	triggers!:ControllerList<TriggerController>;

	private _root!:RootObjectRender;
	get root() { return this._root; }

	model!:SceneModel; // TS: initialized in super constructor

	init(model:ControllerModel) {
		super.init(model);
		this._root = this.renderFactory.create<RootObjectRender>("RootObjectRenderInterface");
		
		this.objects = this.controllers(this.model.$('objects'), ObjectController);
		this.objects.events.added.on(event => this.onObjectAdded(event.controller));
		this.objects.events.removed.on(event => this.onObjectRemoved(event.controller));

		this.triggers = this.controllers(this.model.$('triggers'), TriggerController);
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
