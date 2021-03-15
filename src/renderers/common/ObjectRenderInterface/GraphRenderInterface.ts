import ObjectRenderInterface from "../ObjectRenderInterface";
import CameraRenderInterface from "@/renderers/common/ObjectRenderInterface/CameraRenderInterface";

export default interface GraphRenderInterface extends ObjectRenderInterface {
	setup(setup:GraphSetup):void;
	config(config:GraphConfig):void;
	setData(data:GraphData):void;
	onFrame(): void;
}

type Node = {id:string|number, name?:string, val?:any};
type Link = {source:string|number, target:string|number};

export type GraphData = {nodes:Node[], links: Link[]};

export type GraphSetup = {
	camera: CameraRenderInterface;
};

export type GraphConfig = {
	defaultColor?: string;
	nodeOpacity?: number;
	linkOpacity?: number;
	nodeResolution?: number;
	labelSize?: number;
	nodeGroups?: boolean;
	linkGroups?: boolean;
};
