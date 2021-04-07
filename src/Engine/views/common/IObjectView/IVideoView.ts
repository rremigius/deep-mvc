import VideoModel from "@/Engine/models/ObjectModel/VideoModel";
import IObjectView from "@/Engine/views/common/IObjectView";

export function createVideo(url:string) {
	const video = document.createElement("video");
	const source = document.createElement("source");
	source.src = url;
	source.type = 'video/mp4';
	video.appendChild(source);
	document.body.appendChild(video);
	video.load();

	return video;
}

export default interface IVideoView extends IObjectView {
	load(xrVideo: VideoModel):Promise<this>;
	play():void;
	pause():void;
	stop():void;
}
export const IVideoViewSymbol = Symbol.for("IVideoView");
