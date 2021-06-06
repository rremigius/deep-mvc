import ObjectModel from "@examples/GameEngine/models/ObjectModel";
import GraphLinkModel from "@examples/GameEngine/models/ObjectModel/GraphModel/GraphLinkModel";
import GraphNodeModel from "@examples/GameEngine/models/ObjectModel/GraphModel/GraphNodeModel";
import {Collection, collection} from "mozel";

export default class GraphModel extends ObjectModel {
	static get type() { return 'Graph' };

	@collection(GraphNodeModel)
	nodes!:Collection<GraphNodeModel>;

	@collection(GraphLinkModel)
	links!:Collection<GraphLinkModel>;
}
