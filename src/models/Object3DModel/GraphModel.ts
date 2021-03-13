import ObjectModel from "@/models/ObjectModel";
import Log from "@/log";
import GraphLinkModel from "@/models/Object3DModel/GraphModel/GraphLinkModel";
import GraphNodeModel from "@/models/Object3DModel/GraphModel/GraphNodeModel";
import {Collection, collection, injectable} from "mozel";

const log = Log.instance("Model/ObjectModel/Graph");

@injectable()
export default class GraphModel extends ObjectModel {
	static get type() { return 'Graph' };

	log = log;

	@collection(GraphNodeModel)
	nodes!:Collection<GraphNodeModel>;

	@collection(GraphLinkModel)
	links!:Collection<GraphLinkModel>;
}
