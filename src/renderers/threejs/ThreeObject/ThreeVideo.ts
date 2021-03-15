import ThreeObject from "@/renderers/threejs/ThreeObject";
import VideoRenderInterface, {createVideo} from "@/renderers/common/ObjectRenderInterface/VideoRenderInterface";
import {DoubleSide, LinearFilter, Mesh, MeshBasicMaterial, PlaneGeometry, VideoTexture} from "three";
import {injectable} from "@/renderers/inversify";
import threeContainer from "@/renderers/threejs/inversify";
import VideoModel from "@/models/Object3DModel/VideoModel";
import Log from "@/log";

const log = Log.instance("renderer/xr-three-video");

@injectable(threeContainer, "VideoRenderInterface")
export default class ThreeVideo extends ThreeObject implements VideoRenderInterface {
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
