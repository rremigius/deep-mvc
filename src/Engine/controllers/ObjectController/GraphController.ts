import GrapohModel from "@/Engine/models/ObjectModel/GraphModel";
import GraphLinkModel from "@/Engine/models/ObjectModel/GraphModel/GraphLinkModel";
import GraphNodeModel from "@/Engine/models/ObjectModel/GraphModel/GraphNodeModel";
import {injectable} from "@/Controller";
import ControllerModel from "@/ControllerModel";
import ObjectController from "@/Engine/controllers/ObjectController";
import IGraphView from "@/Engine/views/common/IObjectView/IGraphView";
import Log from "@/log";
import {compact} from 'lodash';
import {alphanumeric} from "validation-kit";

const log = Log.instance("engine/controller/graphcontroller");

type Link = {source:alphanumeric,target:alphanumeric,graphLink:GraphLinkModel};

@injectable()
export default class GraphController extends ObjectController {
	static ModelClass = GrapohModel;

	get xrGraph() {
		return <GrapohModel>this.model;
	}

	graph?:IGraphView;

	debugGenerateData() {
		const N = 50;
		const nodes = [...Array(N).keys()].map(i => GraphNodeModel.create<GraphNodeModel>({
			gid: i,
			label: "Node " + i,
			group: Math.round(Math.random()*5)
		}));
		const relations = [...Array(N).keys()]
			.filter(id => id)
			.map(id => GraphLinkModel.create<GraphLinkModel>({
				from: nodes[id],
				to: nodes[Math.round(Math.random() * (id-1))]
			}));
		this.xrGraph.nodes.clear();
		this.xrGraph.links.clear();
		for(let i in nodes) {
			this.xrGraph.nodes.add(nodes[i]);
		}
		for(let i in relations) {
			this.xrGraph.links.add(relations[i]);
		}
	}

	init(xrObject: ControllerModel) {
		super.init(xrObject);

		this.debugGenerateData();
	}

	async createObjectView() {
		// Generate graph data from definitions
		let nodeGroups = false;
		let linkGroups = false;
		const data = {
			nodes: this.xrGraph.nodes.map((node:GraphNodeModel) => {
				if(node.group) {
					nodeGroups = true;
				}
				return {
					id: node.gid,
					graphNode: node
				};
			}),
			links: compact<Link>(this.xrGraph.links.map((relation:GraphLinkModel) => {
				if(relation.group) {
					linkGroups = true;
				}
				if(!relation.from) {
					log.error(`Relation '${relation.gid}' does not have a 'from' property set.`);
					return;
				}
				if(!relation.to) {
					log.error(`Relation '${relation.gid}' does not have a 'to' property set.`);
					return;
				}
				return {
					source:relation.from.gid,
					target:relation.to.gid,
					graphLink: relation
				};
			}))
		};

		this.graph = this.viewFactory.create<IGraphView>("IGraphView");
		if(this.engine.camera) {
			this.graph.setup({camera: this.engine.camera});
		}
		this.graph.config({nodeGroups, linkGroups});

		log.info(`Loaded ${data.nodes.length} nodes and ${data.links.length} links.`);
		this.graph.setData(data);
		return this.graph;
	}


	onFrame() {
		if(this.graph) {
			this.graph.onFrame();
		}
	}
}
