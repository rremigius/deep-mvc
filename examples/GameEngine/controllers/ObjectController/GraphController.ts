import GraphModel from "@examples/GameEngine/models/ObjectModel/GraphModel";
import ObjectController from "@examples/GameEngine/controllers/ObjectController";

export default class GraphController extends ObjectController {
	static Model = GraphModel;
	model!:GraphModel;
}
