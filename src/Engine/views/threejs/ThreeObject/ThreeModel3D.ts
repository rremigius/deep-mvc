import Model3DModel, {FileType} from "@/Engine/models/ObjectModel/Model3DModel";
import {Group, Object3D} from "three";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader";
import ColladaLoader from "three-collada-loader-2";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import FileModel from "@/Engine/models/FileModel";
import Log from "@/log";
import ThreeObject from "../ThreeObject";
import {ThreeClickEvent} from "@/Engine/views/threejs/ThreeEngineView";
import {check, instanceOf} from "validation-kit";
import ObjectModel from "@/Engine/models/ObjectModel";
import Model3DController from "@/Engine/controllers/ObjectController/Model3DController";

const log = Log.instance("model-3d");

export default class ThreeModel3D extends ThreeObject {
	static Model = Model3DModel;
	model!:Model3DModel;

	controller!:Model3DController;

	init(model: ObjectModel) {
		super.init(model);
		this.controller = this.requireController(Model3DController);
	}

	onThreeClick(event: ThreeClickEvent) {
		super.onThreeClick(event);

		const meshNames = event.intersects.map(mesh => {
			const $object3D = check<Object3D>(mesh, instanceOf(Object3D), "mesh");
			return $object3D.name;
		});
		const foundClickableMesh = meshNames.find(name =>
			this.model.clickableMeshes.find(name) !== undefined
		);
		if (foundClickableMesh) {
			this.controller.clickMesh(foundClickableMesh);
		}
	}

	async load(): Promise<void> {
		const model = this.model;
		switch(model.determineFileType()) {
			case FileType.Collada:
				return this.loadCollada(model);
			case FileType.Obj:
				return this.loadObjFiles(model);
			case FileType.Fbx:
				return this.loadFbx(model);
		}
		return Promise.reject(new Error("Could not determine file type."));
	}

	async loadObjFiles(xrModel3D: Model3DModel): Promise<void> {
		const loader = new OBJLoader();
		const files = xrModel3D.files;

		const materialFile = files.toArray()
			.find((f: FileModel) => f.url.toLowerCase().endsWith("mtl"));
		if(materialFile){
			log.log("Loading OBJ material", materialFile.url);
			const materialLoader = new MTLLoader();
			await materialLoader.load(materialFile.url, materialCreator => {
				materialCreator.preload();
				loader.setMaterials(materialCreator as any); // Typings for `setMaterials` seem to be wrong.

			}, progress => {
			}, error => {
				let err = new Error("Could not load Obj material.");
				return Promise.reject(err);
			});
		}
		const url = xrModel3D.mainFile && xrModel3D.mainFile.url;
		log.log("Loading OBJ", url);
		return new Promise((resolve, reject) => {
			if(!url) {
				reject(new Error("Model3DModel does not have a main file."));
				return;
			}
			loader.load(url, (obj) => {
				log.log("Loaded Obj", url);
				this.object3D.add(obj);
				resolve();
			}, progress => {

			}, reject);
		});

	}

	async loadCollada(xrModel3D: Model3DModel): Promise<void> {
		let loader = new ColladaLoader();
		const url = xrModel3D.mainFile && xrModel3D.mainFile.url;

		log.log("Loading Collada", url);
		return new Promise((resolve, reject) => {
			if(!url) {
				reject(new Error("Model3DModel does not have a main file."));
				return;
			}
			loader.load(url, (collada) => {
				log.log("Loaded Collada", url);
				this.object3D.add(collada.scene);
				resolve();
			},() => {
				// progress not implemented yet
			},reject);
		});
	}

	async loadFbx(xrModel3D: Model3DModel): Promise<void> {
		let loader = new FBXLoader();
		const url = xrModel3D.mainFile && xrModel3D.mainFile.url;

		log.log("Loading FBX", url);
		return new Promise((resolve, reject) => {
			if(!url) {
				reject(new Error("Model3DModel does not have a main file."));
				return;
			}
			loader.load(url, (fbx: Group) => {
				log.log("Loaded Fbx", url);
				const object3D = fbx as Object3D;
				this.object3D.add(object3D);
				resolve();
			},() => {
				// progress not implemented yet
			}, reject);
		});
	}
}
