import ObjectModel from "@/models/ObjectModel";
import {collection, injectableModel} from "@common/classes/Model/Model";
import Collection from "@common/classes/Model/Collection";
import Log from "@/log";
import GraphLinkModel from "@/models/Object3DModel/GraphModel/GraphLinkModel";
import GraphNodeModel from "@/models/Object3DModel/GraphModel/GraphNodeModel";

const log = Log.instance("Model/ObjectModel/Graph");

@injectableModel()
export default class GraphModel extends ObjectModel {
	static get type() { return 'Graph' };

	@collection(GraphNodeModel)
	nodes!:Collection<GraphNodeModel>;

	@collection(GraphLinkModel)
	links!:Collection<GraphLinkModel>;
}
