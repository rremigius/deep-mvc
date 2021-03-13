import {FrameListener} from "@/Engine";
import CameraRenderInterface from "@/renderers/common/ObjectRenderInterface/CameraRenderInterface";
import {Events} from "@/EventInterface";

export class MarkerDetectedEvent {
	constructor(public id:string, public first:boolean) {}
}

export class EngineEvents extends Events {
	markerDetected = this.$event(MarkerDetectedEvent);
}

/**
 * Interface needed to prevent circular dependencies between Engine and Controller
 */
interface EngineInterface {
	camera?:CameraRenderInterface<unknown>;
	addFrameListener:(f:FrameListener)=>void;
	removeFrameListener:(f:FrameListener)=>void;
	callAction:(action:string, payload?:unknown)=>void;
	events:EngineEvents;
}

export default EngineInterface;
export const EngineInterfaceType = Symbol("EngineInterface");
