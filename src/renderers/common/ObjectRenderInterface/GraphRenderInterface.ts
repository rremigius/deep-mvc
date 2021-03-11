import ObjectRenderInterface from "../XRObjectRenderInterface";
import XRCameraRenderInterface from "@/classes/renderers/common/XRObjectRenderInterface/XRCameraRenderInterface";

export default interface GraphRenderInterface<T> extends ObjectRenderInterface<T> {
	setup(setup:GraphSetup<T>):void;
	config(config:GraphConfig):void;
	setData(data:GraphData):void;
	onFrame(): void;
}

type Node = {id:string|number, name?:string, val?:any};
type Link = {source:string|number, target:string|number};

export type GraphData = {nodes:Node[], links: Link[]};

export type GraphSetup<T> = {
	camera: XRCameraRenderInterface<T>;
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
