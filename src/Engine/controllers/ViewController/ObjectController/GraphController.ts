import GraphModel from "@/Engine/models/ObjectModel/GraphModel";
import GraphLinkModel from "@/Engine/models/ObjectModel/GraphModel/GraphLinkModel";
import GraphNodeModel from "@/Engine/models/ObjectModel/GraphModel/GraphNodeModel";
import ObjectController from "@/Engine/controllers/ViewController/ObjectController";
import IGraphView, {IGraphViewSymbol} from "@/Engine/views/common/IObjectView/IGraphView";
import Log from "@/log";
import {compact} from 'lodash';
import {alphanumeric} from "validation-kit";
import Engine from "@/Engine/Engine";

const log = Log.instance("graph-controller");

type Link = {source:alphanumeric,target:alphanumeric,graphLink:GraphLinkModel};

export default class GraphController extends ObjectController {
	static ModelClass = GraphModel;
	static ViewInterface = IGraphViewSymbol;
	model!:GraphModel;

	engine!:Engine;
	get view() { return super.view as IGraphView; };

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
		this.model.nodes.clear();
		this.model.links.clear();
		for(let i in nodes) {
			this.model.nodes.add(nodes[i]);
		}
		for(let i in relations) {
			this.model.links.add(relations[i]);
		}
	}

	init(model: GraphModel) {
		this.engine = this.dependencies.get(Engine);
		super.init(model);
		this.listenTo(this.engine.events.frame, this.onFrame.bind(this));
	}

	createRootView() {
		// TODO: requires controller to be finished for the camera to be available from Engine
		const view = super.createRootView() as IGraphView;
		const model = this.model;

		// Generate graph data from definitions
		let nodeGroups = false;
		let linkGroups = false;
		const data = {
			nodes: model.nodes.map((node:GraphNodeModel) => {
				if(node.group) {
					nodeGroups = true;
				}
				return {
					id: node.gid,
					graphNode: node
				};
			}),
			links: compact<Link>(model.links.map((relation:GraphLinkModel) => {
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

		view.config({nodeGroups, linkGroups});

		log.info(`Loaded ${data.nodes.length} nodes and ${data.links.length} links.`);
		view.setData(data);
		return view;
	}

	onResolveReferences() {
		super.onResolveReferences();
		const camera = this.engine.camera;
		if(camera) {
			this.view.setup({camera: camera});
		}
	}

	onFrame() {
		this.view.onFrame();
	}
}
