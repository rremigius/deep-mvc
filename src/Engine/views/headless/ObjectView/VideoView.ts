import ObjectView from "@/Engine/views/headless/ObjectView";
import IVideoView, {IVideoViewSymbol} from "@/Engine/views/common/IObjectView/IVideoView";
import VideoModel from "@/Engine/models/ObjectModel/VideoModel";
import {injectable} from "@/Engine/views/dependencies";
import headlessContainer from "@/Engine/views/headless/dependencies";

@injectable(headlessContainer, IVideoViewSymbol)
export default class VideoView extends ObjectView implements IVideoView {
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
