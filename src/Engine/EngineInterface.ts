import {FrameListener} from "@/Engine";
import CameraRenderInterface from "@/renderers/common/ObjectRenderInterface/CameraRenderInterface";
import {Events} from "@/EventInterface";

export class MarkerDetectedEvent {
	constructor(public id:string, public first:boolean) {}
}

/**
 * Interface needed to prevent circular dependencies between Engine and Controller
 */
interface EngineInterface {
	camera?:CameraRenderInterface<unknown>;
	addFrameListener:(f:FrameListener)=>void;
	removeFrameListener:(f:FrameListener)=>void;
	callAction:(action:string, payload?:unknown)=>void;
	events:Events;
}

export default EngineInterface;
export const EngineInterfaceType = Symbol("EngineInterface");
