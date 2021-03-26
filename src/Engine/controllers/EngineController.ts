import XRController from "@/Engine/XRController";
import {injectable} from "@/Controller/dependencies";
import EngineModel from "@/Engine/models/EngineModel";

/**
 * The Engine itself should not be an active part of its own rendering hierarchy, but we can add an EngineController that allows
 * other Controllers to contact the Engine.
 */
@injectable()
export default class EngineController extends XRController {
	static ModelClass = EngineModel;
	model!:EngineModel;

	events = this.engine.events;
	actions = this.engine.actions;
}
