import ObjectController from "@/Controller/ObjectController";
import VideoModel from "@/models/Object3DModel/VideoModel";
import {injectableController} from "../inversify";
import VideoRenderInterface from "@/renderers/common/ObjectRenderInterface/VideoRenderInterface";
import Log from "@/log";

const log = Log.instance("xrengine/video");

@injectableController()
export default class VideoController extends ObjectController {
	static ModelClass = VideoModel;

	log = log;

	private videoRender: VideoRenderInterface<unknown> = this.renderFactory.create<VideoRenderInterface<unknown>>("VideoRenderInterface");

	get xrVideo() {
		return <VideoModel>this.model;
	}

	async createObjectRender() {
		return this.videoRender.load(this.xrVideo);
	}

	onDisable() {
		super.onDisable();
		log.info("Pausing video");
		this.videoRender.pause();
	}

	onEnable() {
		super.onEnable();
		log.info("Playing video");
		this.videoRender.play();
	}
}
