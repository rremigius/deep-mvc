import EngineInterface, {EngineActions, EngineEvents} from "@/Engine/EngineInterface";
import CameraRenderInterface from "@/renderers/common/ObjectRenderInterface/CameraRenderInterface";
import ThreeCamera from "@/renderers/threejs/ThreeObject/ThreeCamera";
import {FrameListener} from "@/Engine";

export default class EmptyEngine implements EngineInterface {
	camera:CameraRenderInterface = new ThreeCamera();
	addFrameListener(f:FrameListener) { };
	removeFrameListener(f: FrameListener) { }
	events = new EngineEvents();
	actions = new EngineActions();
}
