import ObjectController from "@/Engine/controllers/ObjectController";
import VideoModel from "@/Engine/models/ObjectModel/VideoModel";
import {injectable} from "@/Controller/dependencies";
import IVideoView, {IVideoViewSymbol} from "@/Engine/views/common/IObjectView/IVideoView";
import Log from "@/log";

const log = Log.instance("controller/video");

@injectable()
export default class VideoController extends ObjectController {
	static ModelClass = VideoModel;
	static ViewInterface = IVideoViewSymbol;

	model!:VideoModel;

	get view() { return super.view as IVideoView }

	log = log;

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
