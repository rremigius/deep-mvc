import IEngine, {EngineActions, EngineEvents} from "@/Engine/IEngine";
import ICameraView from "@/Engine/views/common/IObjectView/ICameraView";
import {FrameListener} from "@/Engine";
import ObjectView from "@/Engine/views/headless/ObjectView";

class BaseCameraView extends ObjectView implements ICameraView {
	setAspectRatio(ratio: number): void {
	}
}

export default class BaseEngine implements IEngine {
	camera:ICameraView = new BaseCameraView();
	addFrameListener(f:FrameListener) { };
	removeFrameListener(f: FrameListener) { }
	events = new EngineEvents();
	actions = new EngineActions();
}
