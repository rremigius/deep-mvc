import {FrameListener} from "@/Engine";
import ICameraView from "@/Engine/views/common/IObjectView/ICameraView";
import {ControllerActions, ControllerEvents} from "@/Controller";

export class MarkerDetectedEvent {
	constructor(public id:string, public first:boolean) {}
}

export class EngineEvents extends ControllerEvents {
	markerDetected = this.$event(MarkerDetectedEvent);
}

export class EnginePauseAction {
	constructor() {}
}

export class EngineActions extends ControllerActions {
	pause = this.$action(EnginePauseAction);
}

/**
 * Interface needed to prevent circular dependencies between Engine and Controller
 */
export default interface IEngine {
	camera?:ICameraView;
	addFrameListener:(f:FrameListener)=>void;
	removeFrameListener:(f:FrameListener)=>void;
	readonly events:EngineEvents;
	readonly actions:EngineActions;
}

export const IEngineSymbol = Symbol("IEngine");
