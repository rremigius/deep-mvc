import ObjectModel from "@examples/game-engine/models/ObjectModel";
import GraphLinkModel from "@examples/game-engine/models/ObjectModel/GraphModel/GraphLinkModel";
import GraphNodeModel from "@examples/game-engine/models/ObjectModel/GraphModel/GraphNodeModel";
import {Collection, collection} from "mozel";

export default class GraphModel extends ObjectModel {
	static get type() { return 'Graph' };

	@collection(GraphNodeModel)
	nodes!:Collection<GraphNodeModel>;

	@collection(GraphLinkModel)
	links!:Collection<GraphLinkModel>;
}
