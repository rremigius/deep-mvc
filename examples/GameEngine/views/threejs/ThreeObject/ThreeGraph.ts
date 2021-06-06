import GraphNode from "@examples/GameEngine/models/ObjectModel/GraphModel/GraphNodeModel";
import {Camera, Material, Mesh, MeshLambertMaterial, Object3D, SphereGeometry} from "three";
import tinycolor from 'tinycolor2';
import {CSS3DObject} from "three-css3drenderer";
import {get} from 'lodash';
import ThreeForceGraph from "three-forcegraph";
import Log from "@/log";
import ThreeObject from "../ThreeObject";
import GraphModel from "@examples/GameEngine/models/ObjectModel/GraphModel";
import Engine from "@examples/GameEngine/Engine";
import ThreeEngineView from "@examples/GameEngine/views/threejs/ThreeEngineView";
import ThreeView from "@examples/GameEngine/views/threejs/ThreeView";

const colorStr2Hex = (str: string) => parseInt(tinycolor(str).toHex(), 16);
const colorAlpha = (str: string) => tinycolor(str).getAlpha();

const log = Log.instance("three-graph");

export default class ThreeGraph extends ThreeObject {
	static Model = GraphModel;
	model!:GraphModel;

	engine!:Engine;
	private engineView?:ThreeEngineView;

	// Cache
	private sphereGeometries: Record<number, SphereGeometry> = {};
	private materials: Record<string, Material> = {};

	private labels: CSS3DObject[] = [];
	private graph!: ThreeForceGraph;
	private camera?: Camera;

	private graphConfig = {
		defaultColor: '#999',
		nodeOpacity: 0.9,
		linkOpacity: 0.9,
		nodeResolution: 16,
		labelSize: 10,
		nodeGroups: true,
		linkGroups: true
	};

	onInit() {
		super.onInit();

		this.engine = this.dependencies.get(Engine);
		this.listenTo(this.engine.events.frame, this.onFrame.bind(this));

		this.graph = this.createGraph();
		this.object3D.add(this.graph);
	}

	onResolveReferences() {
		super.onResolveReferences();
		this.updateCamera();
	}

	setParent(parent?:ThreeView) {
		super.setParent(parent);
		this.updateCamera();
	}

	updateCamera() {
		this.engineView = <ThreeEngineView>this.findParent(component => component instanceof ThreeEngineView);
		const camera = this.engineView.camera.get();
		if(camera) {
			this.camera = camera.camera;
		}
	}

	createNodeLabel(graphNode: GraphNode) {
		const labelDiv = document.createElement('div');
		labelDiv.style.fontSize = this.graphConfig.labelSize + 'px';
		labelDiv.innerHTML = graphNode.label || '';
		return new CSS3DObject(labelDiv);
	}

	createNodeThreeObject(graphNode: GraphNode, autoColor?: string) {
		// Example taken from default node creation in three-forcegraph
		const geometrySize = Math.cbrt(graphNode.size) * 4;
		if (!this.sphereGeometries.hasOwnProperty(geometrySize)) {
			this.sphereGeometries[geometrySize] = new SphereGeometry(geometrySize, this.graphConfig.nodeResolution, this.graphConfig.nodeResolution);
		}

		const color = autoColor || graphNode.color || this.graphConfig.defaultColor!;
		if (!this.materials.hasOwnProperty(color)) {
			this.materials[color] = new MeshLambertMaterial({
				color: colorStr2Hex(color),
				transparent: true,
				opacity: this.graphConfig.nodeOpacity! * colorAlpha(color)
			});
		}

		const nodeGroup = new Object3D();

		const sphere = new Mesh(this.sphereGeometries[geometrySize], this.materials[color]);
		nodeGroup.add(sphere);

		if (graphNode.label) {
			const label = this.createNodeLabel(graphNode);
			label.position.y = geometrySize + this.graphConfig.labelSize!;
			nodeGroup.add(label);
			this.labels.push(label);
		}

		return nodeGroup;
	}

	createGraph() {
		const graph = new ThreeForceGraph();
		graph.nodeVal((node: any) => get(node, 'graphNode.size'));
		graph.nodeOpacity(this.graphConfig.nodeOpacity);
		graph.nodeThreeObject((node: any) => this.createNodeThreeObject(node.graphNode, node.color));
		graph.linkOpacity(this.graphConfig.linkOpacity);
		graph.linkWidth((link: any) => get(link, 'graphLink.size'));
		graph.linkMaterial((link: any) =>
			// We need to make our own material because the default material lacks customProgramCacheKey
			new MeshLambertMaterial({
				color: colorStr2Hex(link.color),
				transparent: true,
				opacity: this.graphConfig.nodeOpacity! * colorAlpha(link.color)
			})
		);

		// Coloring
		if (this.graphConfig.nodeGroups) {
			graph.nodeAutoColorBy((node: any) => {
				return get(node, 'graphNode.group');
			});
		} else {
			graph.nodeColor((node: any) => {
				return get(node, 'graphNode.color', this.graphConfig.defaultColor);
			});
		}
		if (this.graphConfig.linkGroups) {
			graph.linkAutoColorBy((link: any) => {
				return get(link, 'graphLink.group');
			});
		} else {
			graph.linkColor((link: any) => {
				return get(link, 'graphLink.color', this.graphConfig.defaultColor);
			});
		}

		// ThreeForceGraph renders about 100x too large, so setting a more sensible default. Object scale will be applied on top.
		graph.scale.set(0.01, 0.01, 0.01);

		return graph;
	}

	onFrame() {
		if(!this.camera) {
			throw new Error("No camera present.");
		}

		// Make labels look at camera
		for (let label of this.labels) {
			label.lookAt(this.camera.position);
		}

		// Update graph
		this.graph.tickFrame();
	}
}
