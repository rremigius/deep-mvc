import Controller from "@/Controller";
import ControllerModel from "@/ControllerModel";
import IEngine, {IEngineSymbol} from "@/Engine/IEngine";

export default class XRController extends Controller {
	engine!:IEngine;

	init(model: ControllerModel) {
		super.init(model);
		this.engine = this.dependencies.get<IEngine>(IEngineSymbol);
	}
}
