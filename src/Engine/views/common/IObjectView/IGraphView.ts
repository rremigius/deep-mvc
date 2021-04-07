import IObjectView from "../IObjectView";
import ICameraView from "@/Engine/views/common/IObjectView/ICameraView";

export default interface IGraphView extends IObjectView {
	setup(setup:GraphSetup):void;
	config(config:GraphConfig):void;
	setData(data:GraphData):void;
	onFrame(): void;
}
export const IGraphViewSymbol = Symbol.for("IGraphView");

type Node = {id:string|number, name?:string, val?:any};
type Link = {source:string|number, target:string|number};

export type GraphData = {nodes:Node[], links: Link[]};

export type GraphSetup = {
	camera: ICameraView;
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
