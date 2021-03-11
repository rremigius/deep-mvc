import Controller, {injectableController} from "@/Controller";
import ControllerModel from "@/models/ControllerModel";
import ObjectController from "@/Controller/ObjectController";
import SceneModel from "@/models/SceneModel";
import TriggerController from "./TriggerController";
import ControllerRootRenderInterface from "@/renderers/common/ObjectRenderInterface/ControllerRootRenderInterface";
import {MarkerDetectedEvent} from "@/Engine/EngineInterface";
import {Payload} from "@/Events";
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
		this.objects.onAdded(controller => this.onObjectAdded(controller));
		this.objects.onRemoved(controller => this.onObjectRemoved(controller));
		this.setupControllerList(this.objects, this.xrScene.objects, ObjectController);

		// Create triggers
		this.triggers = this.createControllerList(this.xrScene.triggers, TriggerController);
		this.triggers.each(trigger => trigger.setDefaultController(this));

		this.initEngineTriggerInterfaces();
	}

	initEngineTriggerInterfaces() {
		this.engine.on<MarkerDetectedEvent>(MarkerDetectedEvent.name, (payload:Payload<MarkerDetectedEvent>)=>{
			this.fire<MarkerDetectedEvent>(MarkerDetectedEvent.name, payload);
		});
	}

	onObjectAdded(xrObjectController:ObjectController) {
		this.root.add(xrObjectController.root);
	}

	onObjectRemoved(xrObjectController:ObjectController) {
		this.root.remove(xrObjectController.root);
	}
}
