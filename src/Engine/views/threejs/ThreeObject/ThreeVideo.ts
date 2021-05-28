import {DoubleSide, LinearFilter, Mesh, MeshBasicMaterial, PlaneGeometry, VideoTexture} from "three";
import VideoModel from "@/Engine/models/ObjectModel/VideoModel";
import Log from "@/log";
import ThreeObject from "@/Engine/views/threejs/ThreeObject";
import {createVideo} from "@/Engine/views/common/Video";
import {schema} from "mozel";
import VideoController from "@/Engine/controllers/ObjectController/VideoController";
import {get} from "lodash";
import {fitInSide} from "@/View/Geometry";

const log = Log.instance("three-video");

export default class ThreeVideo extends ThreeObject {
	static Model = VideoModel;
	model!:VideoModel;

	controller!:VideoController;

	mesh?:Mesh;
	video?: HTMLVideoElement;
	videoTexture?: VideoTexture;
	loaded:boolean = false;

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
			log.info("Playing video.");
			this.video.play();
		}
	}

	pause() {
		if(!this.video) {
			return;
		}
		log.info("Pausing video.");
		this.video.pause();
	}

	onVideoReady() {
		if(!this.video) {
			log.error("onVideoReady was called but there is no video.");
			return;
		}
		log.info(`Video loaded: ${get(this.model, 'file.url')}.`);
		this.loaded = true;

		if(this.model.playing) {
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

		if(this.video) {
			this.video.remove();
			this.video = undefined;
		}
		log.info("Video cleared");
	}

	createMesh(video:HTMLVideoElement) {
		const videoTexture = new VideoTexture(video);
		videoTexture.minFilter = LinearFilter;
		videoTexture.magFilter = LinearFilter;

		const dimensions = fitInSide(video.videoWidth, video.videoHeight, 1, 1);

		const geometry = new PlaneGeometry(dimensions.width, dimensions.height, 4, 4);
		const material = new MeshBasicMaterial({ map: videoTexture, side: DoubleSide });
		const mesh = new Mesh(geometry, material);
		mesh.rotation.x = -Math.PI / 2;

		return mesh;
	}

	async loadVideo(url:string):Promise<void> {
		return new Promise((resolve, reject) => {
			log.log("Loading video", url);

			const video = createVideo(url);
			video.style.display = 'none';

			video.addEventListener('loadeddata', () => {
				this.mesh = this.createMesh(video);
				this.object3D.add(this.mesh);
				this.onVideoReady();
				resolve();
			});
			video.addEventListener('error', (error) => {
				this.clear();
				log.error("Could not load video: " + error);
				reject(new Error("Could not load video: " + error));
			});

			this.clear();
			this.video = video;
		});
	}
}
