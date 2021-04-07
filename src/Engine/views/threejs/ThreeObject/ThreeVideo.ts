import IVideoView, {createVideo, IVideoViewSymbol} from "@/Engine/views/common/IObjectView/IVideoView";
import {DoubleSide, LinearFilter, Mesh, MeshBasicMaterial, PlaneGeometry, VideoTexture} from "three";
import VideoModel from "@/Engine/models/ObjectModel/VideoModel";
import Log from "@/log";
import ThreeObject from "@/Engine/views/threejs/ThreeObject";

const log = Log.instance("three-video");

export default class ThreeVideo extends ThreeObject implements IVideoView {
	static ViewInterface = IVideoViewSymbol;

	video?: HTMLVideoElement;
	videoTexture?: VideoTexture;
	loaded:boolean = false;
	pendingPlay:boolean = false;

	play() {
		if (this.video && this.loaded) {
			this.video.play();
		} else {
			this.pendingPlay = true;
		}
	}

	pause() {
		if(!this.video) {
			return;
		}
		this.video.pause();
	}

	stop() {
		if(!this.video) return;
		this.video.pause();
		this.video.currentTime = 0;
	}

	onVideoReady() {
		if(!this.video) {
			log.error("onVideoReady was called but there is no video.");
			return;
		}
		this.loaded = true;
		if(this.pendingPlay) {
			this.play();
		}
	}

	async load(xrVideo: VideoModel):Promise<this> {
		return new Promise((resolve, reject) => {
			if (!xrVideo.file || !xrVideo.file.url) {
				const err = new Error("Video has no video file. Cannot load.");
				log.error(err.message);
				reject(err);
				return;
			}

			const url = xrVideo.file.url;
			log.log("Loading video", url);

			this.video = createVideo(xrVideo.file.url);

			this.video.addEventListener('loadeddata', () => {
				this.onVideoReady();
				resolve(this);
			});
			this.video.addEventListener('error', (error) => {
				log.error("Could not load video: " + error);
				reject(new Error("Could not load video: " + error));
			});

			const videoTexture = new VideoTexture(this.video);
			videoTexture.minFilter = LinearFilter;
			videoTexture.magFilter = LinearFilter;
			this.videoTexture = videoTexture;

			// Create geometry
			const geometry = new PlaneGeometry( 2.4, 1, 4, 4);
			const material = new MeshBasicMaterial( { map: videoTexture, side: DoubleSide  } );
			const mesh = new Mesh( geometry, material );
			mesh.rotation.x = -Math.PI / 2;

			this.object3D.add(mesh);
		});
	}
}
