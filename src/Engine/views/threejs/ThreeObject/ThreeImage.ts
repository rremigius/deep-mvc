import {Mesh, MeshBasicMaterial, PlaneGeometry, TextureLoader} from "three";
import Log from "@/log";
import ImageModel from "@/Engine/models/ObjectModel/ImageModel";
import {injectable} from "@/Engine/views/dependencies";
import threeContainer from "@/Engine/views/threejs/dependencies";
import IImageView from "@/Engine/views/common/IObjectView/IImageView";
import ThreeRootObject from "@/Engine/views/threejs/ThreeObject/ThreeRootObject";

const log = Log.instance("Controller/Object/Object3D");

@injectable(threeContainer, "IImageView")
export default class ThreeImage extends ThreeRootObject implements IImageView {
	async load(xrImage: ImageModel): Promise<this> {
		return new Promise((resolve, reject) => {
			if (!xrImage.file || !xrImage.file.url) {
				const err = new Error("ImageModel has no image file. Cannot load.");
				log.error(err.message);
				reject(err);
				return;
			}

			const url = xrImage.file.url;
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
					resolve(this);
				},
				undefined, // progress callback currently not supported (THREE docs)
				() => {
					const err = new Error("Failed to load image.");
					log.error(err.message, xrImage.file);
					reject(err);
				}
			);
		});
	}
}
