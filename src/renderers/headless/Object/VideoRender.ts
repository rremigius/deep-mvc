import ObjectRender from "@/renderers/headless/ObjectRender";
import VideoRenderInterface from "@/renderers/common/ObjectRenderInterface/VideoRenderInterface";
import VideoModel from "@/models/Object3DModel/VideoModel";
import {injectable} from "@/renderers/inversify";
import headlessContainer from "@/renderers/headless/inversify";

@injectable(headlessContainer, "SceneRenderInterface")
export default class VideoRender extends ObjectRender implements VideoRenderInterface {
	load(xrVideo: VideoModel): Promise<this> {
		return Promise.resolve(this);
	}

	pause(): void {
	}

	play(): void {
	}

	stop(): void {
	}

}
