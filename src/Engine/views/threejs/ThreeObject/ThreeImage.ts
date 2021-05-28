import {Mesh, MeshBasicMaterial, PlaneGeometry, TextureLoader} from "three";
import Log from "@/log";
import ImageModel from "@/Engine/models/ObjectModel/ImageModel";
import ThreeObject from "../ThreeObject";
import {schema} from "mozel";
import {fitInSide} from "@/View/Geometry";

const log = Log.instance("three-image");

export default class ThreeImage extends ThreeObject {
	static Model = ImageModel;
	model!:ImageModel;

	mesh?:Mesh;

	onInit() {
		super.onInit();
		this.model.$watch(schema(ImageModel).file.url, async url => {
			if(url) {
				await this.loadImage(url);
			} else {
				this.clear();
			}
		});
	}

	clear() {
		if(!this.mesh) return;

		this.object3D.remove(this.mesh);
		this.mesh = undefined;
		log.log("Image cleared.");
	}

	async onLoad() {
		if(!this.model.file || !this.model.file.url) return;
		await this.loadImage(this.model.file.url);
	}

	async loadImage(url:string):Promise<void> {
		return new Promise((resolve, reject) => {
			log.log("Loading image", url);
			new TextureLoader().load(url,
				texture => {
					const dimensions = fitInSide(texture.image.width, texture.image.height, 1, 1);

					// Create geometry
					const geometry = new PlaneGeometry( dimensions.width, dimensions.height, 1 );
					const material = new MeshBasicMaterial( { color: 0xffffff } );
					const mesh = new Mesh( geometry, material );
					mesh.rotation.x = -Math.PI / 2;

					// Set image texture
					material.map = texture;
					material.needsUpdate = true;

					this.clear();
					this.mesh = mesh;
					this.object3D.add(mesh);

					log.log("Loaded image", url);
					resolve();
				},
				undefined, // progress callback currently not supported (THREE docs)
				() => {
					const err = new Error("Failed to load image.");
					log.error(err.message, url);
					reject(err);
				}
			);
		});
	}
}
