import XRObjectRenderInterface from "@/classes/renderers/common/XRObjectRenderInterface";
import XRVideoModel from "@common/models/XRObject3DModel/XRVideoModel";

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

export default interface VideoRenderInterface<T> extends XRObjectRenderInterface<T> {
	load(xrVideo: XRVideoModel):Promise<this>;
	play():void;
	pause():void;
	stop():void;
}
