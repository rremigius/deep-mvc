import {FrameListener} from "@/Engine";
import ICameraView from "@/Engine/views/common/IObjectView/ICameraView";
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
export default interface IEngine {
	camera?:ICameraView;
	addFrameListener:(f:FrameListener)=>void;
	removeFrameListener:(f:FrameListener)=>void;
	events:EngineEvents;
	actions:EngineActions;
}

export const IEngineSymbol = Symbol("IEngine");
