import ObjectModel from "@/Engine/models/ObjectModel";
import Log from "@/log";
import GraphLinkModel from "@/Engine/models/ObjectModel/GraphModel/GraphLinkModel";
import GraphNodeModel from "@/Engine/models/ObjectModel/GraphModel/GraphNodeModel";
import {Collection, collection} from "mozel";

const log = Log.instance("Model/ObjectModel/Graph");

export default class GraphModel extends ObjectModel {
	static get type() { return 'Graph' };

	log = log;

	@collection(GraphNodeModel)
	nodes!:Collection<GraphNodeModel>;

	@collection(GraphLinkModel)
	links!:Collection<GraphLinkModel>;
}
