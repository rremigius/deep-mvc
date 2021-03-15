import GraphNode from "@/models/Object3DModel/GraphModel/GraphNodeModel";
import {Camera, Material, Mesh, MeshLambertMaterial, Object3D, SphereGeometry} from "three";
import ThreeObject from "../ThreeObject";
import tinycolor from 'tinycolor2';
import {CSS3DObject} from "three-css3drenderer";
import {get} from 'lodash';
import GraphRenderInterface, {
	GraphConfig,
	GraphData,
	GraphSetup
} from "@/renderers/common/ObjectRenderInterface/GraphRenderInterface";
import ThreeCamera from "./ThreeCamera";
import ThreeForceGraph from "three-forcegraph";
import {injectable} from "@/renderers/inversify";
import threeContainer from "@/renderers/threejs/inversify";
import Log from "@/log";

const colorStr2Hex = (str: string) => parseInt(tinycolor(str).toHex(), 16);
const colorAlpha = (str: string) => tinycolor(str).getAlpha();

const log = Log.instance("Engine/Renderer/ThreeGraph");

@injectable(threeContainer, "GraphRenderInterface")
export default class ThreeGraph extends ThreeObject implements GraphRenderInterface {

	// Cache
	private sphereGeometries: Record<number, SphereGeometry> = {};
	private materials: Record<string, Material> = {};

	private labels: CSS3DObject[] = [];
	private readonly graph: ThreeForceGraph;
	private camera?: Camera;

	private graphConfig:GraphConfig = {
		defaultColor: '#999',
		nodeOpacity: 0.9,
		linkOpacity: 0.9,
		nodeResolution: 16,
		labelSize: 10,
		nodeGroups: true,
		linkGroups: true
	};

	constructor() {
		super();

		this.graph = new ThreeForceGraph();
		this.getObject3D().add(this.graph);
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

	setData(data:GraphData) {
		this.graph.graphData(data);
	}

	setup(setup:GraphSetup) {
		if(!(setup.camera instanceof ThreeCamera)) {
			log.error("Camera is not a THREE Camera.", setup.camera);
			return;
		}
		this.camera = setup.camera.getObject3D();
	}

	config(config:GraphConfig) {
		this.graphConfig = { ...this.graphConfig, ...config};

		this.graph
			.nodeVal((node: any) => {
				return get(node, 'graphNode.size');
			})
			.linkWidth((link: any) => {
				return get(link, 'graphLink.size');
			})
			.nodeOpacity(this.graphConfig.nodeOpacity)
			.linkOpacity(this.graphConfig.linkOpacity)
			.nodeThreeObject((node: any) =>
				this.createNodeThreeObject(node.graphNode, node.color)
			);

		// Coloring
		if (this.graphConfig.nodeGroups) {
			this.graph.nodeAutoColorBy((node: any) => {
				return get(node, 'graphNode.group');
			});
		} else {
			this.graph.nodeColor((node: any) => {
				return get(node, 'graphNode.color', this.graphConfig.defaultColor);
			});
		}
		if (this.graphConfig.linkGroups) {
			this.graph.linkAutoColorBy((link: any) => {
				return get(link, 'graphLink.group');
			});
		} else {
			this.graph.linkColor((link: any) => {
				return get(link, 'graphLink.color', this.graphConfig.defaultColor);
			});
		}

		// ThreeForceGraph renders about 100x too large, so setting a more sensible default. Object scale will be applied on top.
		this.graph.scale.set(0.01, 0.01, 0.01);
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
