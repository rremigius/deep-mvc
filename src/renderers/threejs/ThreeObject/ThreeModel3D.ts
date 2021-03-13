import Model3DRenderInterface from "../../common/ObjectRenderInterface/Model3DRenderInterface";
import Model3DModel, {FileType} from "@common/models/Object3DModel/Model3DModel";
import {Group, Object3D} from "three";
import Err from "@utils/error";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import {MaterialCreator, MTLLoader} from "three/examples/jsm/loaders/MTLLoader";
import ColladaLoader from "three-collada-loader-2";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import ThreeObject from "../ThreeObject";
import FileModel from "@common/models/FileModel";
import Log from "@utils/log";
import {injectableRenderClass} from "@/renderers/inversify";
import threeContainer from "@/renderers/threejs/inversify";

const log = Log.instance("Controller/Object/Object3D");

@injectableRenderClass(threeContainer, "Model3DRenderInterface")
export class ThreeModel3D extends ThreeObject implements Model3DRenderInterface<Object3D> {
	async load(xrModel3D: Model3DModel): Promise<this> {
		switch(xrModel3D.determineFileType()) {
			case FileType.Collada:
				return this.loadCollada(xrModel3D);
			case FileType.Obj:
				return this.loadObjFiles(xrModel3D);
			case FileType.Fbx:
				return this.loadFbx(xrModel3D);
		}
		return Promise.reject(new Err({
			message: "Could not determine file type.",
			data: xrModel3D.files
		}));
	}

	async loadObjFiles(xrModel3D: Model3DModel): Promise<this> {
		const loader = new OBJLoader();
		const files = xrModel3D.files;

		const materialFile = files.toArray()
			.find((f: FileModel) => f.url.toLowerCase().endsWith("mtl"));
		if(materialFile){
			log.log("Loading OBJ material", materialFile.url);
			const materialLoader = new MTLLoader();
			await materialLoader.load(materialFile.url, (materialCreator: MaterialCreator) => {
				materialCreator.preload();
				loader.setMaterials(materialCreator as any); // Typings for `setMaterials` seem to be wrong.

			}, progress => {
			}, error => {
				let err = new Err({
					message: "Could not load Obj material.",
					originalError: new Err(error.message)
				});
				return Promise.reject(err);
			});
		}
		const url = xrModel3D.mainFile && xrModel3D.mainFile.url;
		log.log("Loading OBJ", url);
		return new Promise((resolve, reject) => {
			if(!url) {
				reject(new Err("Model3DModel does not have a main file."));
				return;
			}
			loader.load(url, (obj) => {
				log.log("Loaded Obj", url);
				this.object3D.add(obj);
				resolve(this);
			}, progress => {

			}, error => {
				let err = new Err({
					message: "Could not load Obj model.",
					originalError: new Err(error.message)
				});
				reject(err);
			});
		});

	}

	async loadCollada(xrModel3D: Model3DModel): Promise<this> {
		let loader = new ColladaLoader();
		const url = xrModel3D.mainFile && xrModel3D.mainFile.url;

		log.log("Loading Collada", url);
		return new Promise((resolve, reject) => {
			if(!url) {
				reject(new Err("Model3DModel does not have a main file."));
				return;
			}
			loader.load(url, (collada) => {
				log.log("Loaded Collada", url);
				this.object3D.add(collada.scene);
				resolve(this);
			},() => {
				// progress not implemented yet
			},(error: Error) => {
				let err = new Err({
					message: "Could not load Collada model.",
					originalError: error
				});
				reject(err);
			});
		});
	}

	async loadFbx(xrModel3D: Model3DModel): Promise<this> {
		let loader = new FBXLoader();
		const url = xrModel3D.mainFile && xrModel3D.mainFile.url;

		log.log("Loading FBX", url);
		return new Promise((resolve, reject) => {
			if(!url) {
				reject(new Err("Model3DModel does not have a main file."));
				return;
			}
			loader.load(url, (fbx: Group) => {
				log.log("Loaded Fbx", url);
				const object3D = fbx as Object3D;
				this.object3D.add(object3D);
				resolve(this);
			},() => {
				// progress not implemented yet
			},(error: ErrorEvent) => {
				let err = new Err({
					message: "Could not load Fbx model.",
					originalError: error
				});
				reject(err);
			});
		});
	}
}
