import IVideoView, {IVideoViewSymbol} from "@/Engine/views/common/IObjectView/IVideoView";
import VideoModel from "@/Engine/models/ObjectModel/VideoModel";
import ObjectView from "@/Engine/views/headless/ObjectView";

export default class VideoView extends ObjectView implements IVideoView {
	static ViewInterface = IVideoViewSymbol;
	
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
