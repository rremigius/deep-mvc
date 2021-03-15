import {FrameListener} from "@/Engine";
import CameraRenderInterface from "@/renderers/common/ObjectRenderInterface/CameraRenderInterface";
import {Events} from "@/EventEmitter";

export class MarkerDetectedEvent {
	constructor(public id:string, public first:boolean) {}
}

export class EngineEvents extends Events {
	markerDetected = this.$event(MarkerDetectedEvent);
}

export class EngineActions extends Events {

}

/**
 * Interface needed to prevent circular dependencies between Engine and Controller
 */
interface EngineInterface {
	camera?:CameraRenderInterface;
	addFrameListener:(f:FrameListener)=>void;
	removeFrameListener:(f:FrameListener)=>void;
	events:EngineEvents;
	actions:EngineActions;
}

export default EngineInterface;
export const EngineInterfaceType = Symbol("EngineInterface");
