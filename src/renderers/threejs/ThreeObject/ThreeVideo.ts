import XRThreeObject from "@/classes/renderers/threejs/XRThreeObject";
import XRVideoRenderInterface, {createVideo} from "@/classes/renderers/common/XRObjectRenderInterface/XRVideoRenderInterface";
import {DoubleSide, LinearFilter, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, VideoTexture} from "three";
import {injectableXRObjectRender} from "@/classes/renderers/inversify";
import threeContainer from "@/classes/renderers/threejs/inversify";
import XRVideoModel from "@common/models/XRObject3DModel/XRVideoModel";
import Err from "@utils/error";
import Log from "@utils/log";

const log = Log.instance("renderer/xrthreevideo");

@injectableXRObjectRender(threeContainer, "XRVideoRenderInterface")
export default class ThreeVideo extends XRThreeObject implements XRVideoRenderInterface<Object3D> {
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

	async load(xrVideo: XRVideoModel):Promise<this> {
		return new Promise((resolve, reject) => {
			if (!xrVideo.file || !xrVideo.file.url) {
				const err = new Err({
					message: "XRVideo has no video file. Cannot load.",
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
