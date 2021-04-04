import {controllers, injectable} from "@/Controller";
import ControllerModel from "@/ControllerModel";
import Log from "@/log";
import ObjectModel from "@/Engine/models/ObjectModel";
import TriggerController from "@/Engine/controllers/TriggerController";
import BehaviourController from "@/Engine/controllers/BehaviourController";
import ControllerList from "@/Controller/ControllerList";
import {schema} from "mozel";
import ViewController from "@/Controller/ViewController";
import {IObjectViewSymbol} from "@/Engine/views/common/IObjectView";

const log = Log.instance("Engine/Object");

@injectable()
export default class ObjectController extends ViewController {
	static ModelClass = ObjectModel;
	model!:ObjectModel;
	viewInterface = IObjectViewSymbol;

	log = log;

	@controllers(schema(ObjectModel).behaviours, BehaviourController)
	behaviours!:ControllerList<BehaviourController>;

	@controllers(schema(ObjectModel).triggers, TriggerController)
	triggers!:ControllerList<TriggerController>;

	init(xrObject:ControllerModel) {
		super.init(xrObject);

		this.triggers.events.added.on(event => event.controller.setDefaultController(this));
		this.triggers.events.removed.on(event => event.controller.setDefaultController(undefined));
	}
}
