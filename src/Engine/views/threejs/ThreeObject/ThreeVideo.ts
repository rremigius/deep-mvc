import {DoubleSide, LinearFilter, Mesh, MeshBasicMaterial, PlaneGeometry, VideoTexture} from "three";
import VideoModel from "@/Engine/models/ObjectModel/VideoModel";
import Log from "@/log";
import ThreeObject from "@/Engine/views/threejs/ThreeObject";
import {createVideo} from "@/Engine/views/common/Video";
import {schema} from "mozel";
import VideoController from "@/Engine/controllers/ObjectController/VideoController";

const log = Log.instance("three-video");

export default class ThreeVideo extends ThreeObject {
	static Model = VideoModel;
	model!:VideoModel;

	controller!:VideoController;

	mesh?:Mesh;
	video?: HTMLVideoElement;
	videoTexture?: VideoTexture;
	loaded:boolean = false;
	pendingPlay:boolean = false;

	onInit() {
		super.onInit();

		this.controller = this.requireController(VideoController);
		this.model.$watch(schema(VideoModel).playing, playing => {
			if(playing) this.play();
			else this.pause();
		});
		this.model.$watch(schema(VideoModel).file.url, async url => {
			await this.loadVideo(url);
		});
	}

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

	async onLoad():Promise<void> {
		if(!this.model.file || !this.model.file.url) return;
		await this.loadVideo(this.model.file.url);
	}

	clear() {
		if(!this.mesh) return;

		this.object3D.remove(this.mesh);
		this.mesh = undefined;
		log.info("Video cleared");
	}

	async loadVideo(url:string):Promise<void> {
		return new Promise((resolve, reject) => {
			log.log("Loading video", url);

			const video = createVideo(url);
			const videoTexture = new VideoTexture(video);
			videoTexture.minFilter = LinearFilter;
			videoTexture.magFilter = LinearFilter;

			video.addEventListener('loadeddata', () => {
				this.onVideoReady();
				resolve();
			});
			video.addEventListener('error', (error) => {
				log.error("Could not load video: " + error);
				reject(new Error("Could not load video: " + error));
			});

			// Create geometry
			const geometry = new PlaneGeometry( 2.4, 1, 4, 4);
			const material = new MeshBasicMaterial( { map: videoTexture, side: DoubleSide  } );
			const mesh = new Mesh( geometry, material );
			mesh.rotation.x = -Math.PI / 2;

			this.clear();
			this.mesh = mesh;
			this.object3D.add(mesh);
		});
	}
}
