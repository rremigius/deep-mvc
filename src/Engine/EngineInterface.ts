import {FrameListener} from "@/Engine";
import CameraRenderInterface from "@/renderers/common/ObjectRenderInterface/CameraRenderInterface";
import {EventInterfacer, Event} from "event-interface-mixin";

export class MarkerDetectedEvent extends Event<{id:string, first:boolean}>{}

/**
 * Interface needed to prevent circular dependencies between Engine and Controller
 */
interface EngineInterface extends EventInterfacer {
	camera?:CameraRenderInterface<unknown>;
	addFrameListener:(f:FrameListener)=>void;
	removeFrameListener:(f:FrameListener)=>void;
	callAction:(action:string, payload?:unknown)=>void;
}

export default EngineInterface;
export const EngineInterfaceType = Symbol("EngineInterface");
