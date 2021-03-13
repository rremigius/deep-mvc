declare module 'three-forcegraph' {

	import {Object3D} from "three";
	import { GraphData } from "@/classes/renderers/common/XRObjectRenderInterface/XRGraphRenderInterface";

	export default class ThreeForceGraph extends Object3D {
		[key:string]:any;
		graphData(data: GraphData): ThreeForceGraph;
		graphData(): GraphData;
		tickFrame(): void;
	}
}
