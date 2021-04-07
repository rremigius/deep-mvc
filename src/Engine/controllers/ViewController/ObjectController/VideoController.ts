import ObjectController from "@/Engine/controllers/ViewController/ObjectController";
import VideoModel from "@/Engine/models/ObjectModel/VideoModel";
import IVideoView, {IVideoViewSymbol} from "@/Engine/views/common/IObjectView/IVideoView";
import Log from "@/log";

const log = Log.instance("video-controller");

export default class VideoController extends ObjectController {
	static ModelClass = VideoModel;
	static ViewInterface = IVideoViewSymbol;

	model!:VideoModel;

	get view() { return super.view as IVideoView }

	async onLoad() {
		await this.view.load(this.model);
	}

	onDisable() {
		super.onDisable();
		log.info("Pausing video");
		this.view.pause();
	}

	onEnable() {
		super.onEnable();
		log.info("Playing video");
		this.view.play();
	}
}
