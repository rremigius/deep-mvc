import {Mesh, MeshBasicMaterial, PlaneGeometry, TextureLoader} from "three";
import Log from "@/log";
import ImageModel from "@/Engine/models/ObjectModel/ImageModel";
import ThreeObject from "../ThreeObject";

const log = Log.instance("three-image");

export default class ThreeImage extends ThreeObject {
	static Model = ImageModel;
	model!:ImageModel;

	async onLoad():Promise<void> {
		const model = this.model;
		return new Promise((resolve, reject) => {
			if (!model.file || !model.file.url) {
				const err = new Error("ImageModel has no image file. Cannot load.");
				log.error(err.message);
				reject(err);
				return;
			}

			const url = model.file.url;
			log.log("Loading image", url);
			new TextureLoader().load(url,
				texture => {
					// Create geometry
					const geometry = new PlaneGeometry( 1, 1, 1 );
					const material = new MeshBasicMaterial( { color: 0xffffff } );
					const mesh = new Mesh( geometry, material );
					mesh.rotation.x = -Math.PI / 2;

					// Set image texture
					material.map = texture;
					material.needsUpdate = true;

					// Resize mesh
					const img = material.map.image;
					const height = img.height / img.width;
					mesh.scale.set(1, height, 1);

					this.object3D.add(mesh);

					log.log("Loaded image", url);
					resolve();
				},
				undefined, // progress callback currently not supported (THREE docs)
				() => {
					const err = new Error("Failed to load image.");
					log.error(err.message, model.file);
					reject(err);
				}
			);
		});
	}
}
