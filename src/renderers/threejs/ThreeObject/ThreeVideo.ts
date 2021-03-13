import ThreeObject from "@/renderers/threejs/ThreeObject";
import VideoRenderInterface, {createVideo} from "@/renderers/common/ObjectRenderInterface/VideoRenderInterface";
import {DoubleSide, LinearFilter, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, VideoTexture} from "three";
import {injectableObjectRender} from "@/renderers/inversify";
import threeContainer from "@/renderers/threejs/inversify";
import VideoModel from "@common/models/Object3DModel/VideoModel";
import Err from "@utils/error";
import Log from "@utils/log";

const log = Log.instance("renderer/xrthreevideo");

@injectableObjectRender(threeContainer, "VideoRenderInterface")
export default class ThreeVideo extends ThreeObject implements VideoRenderInterface<Object3D> {
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
				const err = new Err({
					message: "Video has no video file. Cannot load.",
					data: this
				});
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
				reject(new Err("Could not load video: " + error));
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
