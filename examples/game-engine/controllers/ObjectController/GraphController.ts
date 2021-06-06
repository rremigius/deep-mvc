import GraphModel from "@examples/game-engine/models/ObjectModel/GraphModel";
import ObjectController from "@examples/game-engine/controllers/ObjectController";

export default class GraphController extends ObjectController {
	static Model = GraphModel;
	model!:GraphModel;
}
