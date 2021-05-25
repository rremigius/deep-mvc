import GraphModel from "@/Engine/models/ObjectModel/GraphModel";
import ObjectController from "@/Engine/controllers/ViewController/ObjectController";

export default class GraphController extends ObjectController {
	static ModelClass = GraphModel;
	model!:GraphModel;
}
