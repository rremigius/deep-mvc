import {Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, TextureLoader} from "three";
import Err from "@utils/error";
import ThreeObject from "./XRThreeObject";
import Log from "@utils/log";
import XRImageModel from "@common/models/XRObject3DModel/XRImageModel";
import {injectableXRObjectRender} from "@/classes/renderers/inversify";
import threeContainer from "@/classes/renderers/threejs/inversify";
import XRImageRenderInterface from "@/classes/renderers/common/XRObjectRenderInterface/XRImageRenderInterface";

const log = Log.instance("XRController/Object/Object3D");

@injectableXRObjectRender(threeContainer, "XRImageRenderInterface")
export default class ThreeImage extends ThreeObject implements XRImageRenderInterface<Object3D> {
	async load(xrImage: XRImageModel): Promise<this> {
		return new Promise((resolve, reject) => {
			if (!xrImage.file || !xrImage.file.url) {
				const err = new Err({
					message: "XRImageModel has no image file. Cannot load.",
					data: this
				});
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
					const material = new MeshBasicMaterial( { color: 0xffffff, flatShading: true } );
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
					const err = new Err({message: "Failed to load image.", data: {file: xrImage.file}});
					reject(err);
				}
			);
		});
	}
}
