import ObjectController from "@/Engine/controllers/ObjectController";
import VideoModel from "@/Engine/models/ObjectModel/VideoModel";
import {injectable} from "@/Controller/dependencies";
import IVideoView, {IVideoViewSymbol} from "@/Engine/views/common/IObjectView/IVideoView";
import Log from "@/log";

const log = Log.instance("xrengine/video");

@injectable()
export default class VideoController extends ObjectController {
	static ModelClass = VideoModel;

	log = log;

	private videoView: IVideoView = this.viewFactory.create<IVideoView>(IVideoViewSymbol);

	get xrVideo() {
		return <VideoModel>this.model;
	}

	async createObjectView() {
		return this.videoView.load(this.xrVideo);
	}

	onDisable() {
		super.onDisable();
		log.info("Pausing video");
		this.videoView.pause();
	}

	onEnable() {
		super.onEnable();
		log.info("Playing video");
		this.videoView.play();
	}
}
