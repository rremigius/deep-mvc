import Model3DModel, {FileType} from "@examples/GameEngine/models/ObjectModel/Model3DModel";
import {Group, Object3D} from "three";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import FileModel from "@examples/GameEngine/models/FileModel";
import Log from "@/log";
import ThreeObject from "../ThreeObject";
import {ThreeClickEvent} from "@examples/GameEngine/views/threejs/ThreeEngineView";
import {check, instanceOf} from "validation-kit";
import Model3DController from "@examples/GameEngine/controllers/ObjectController/Model3DController";
import {get} from 'lodash';
import {deep, schema} from "mozel";
import {ColladaLoader} from "three/examples/jsm/loaders/ColladaLoader";

const log = Log.instance("model-3d");

export default class ThreeModel3D extends ThreeObject {
	static Model = Model3DModel;
	model!:Model3DModel;

	model3D?:Object3D;
	controller!:Model3DController;

	onInit() {
		super.onInit();
		this.controller = this.requireController(Model3DController);
	}

	async onLoad(): Promise<void> {
		return new Promise((resolve, reject) => {
			// We start watching and it will fire immediately, starting the first loading
			this.watchAlways(schema(Model3DModel).files, async () => {
				resolve(this.loadModel());
			}, {deep});
		})
	}

	onThreeClick(event: ThreeClickEvent) {
		super.onThreeClick(event);

		const meshNames = event.intersects.map(mesh => {
			const object3D = check<Object3D>(get(mesh, 'object'), instanceOf(Object3D), "Object3D", 'mesh.object');
			return object3D.name;
		});
		const foundClickableMesh = meshNames.find(name =>
			this.model.clickableMeshes.find(name) !== undefined
		);
		if (foundClickableMesh) {
			this.controller.clickMesh(foundClickableMesh);
		}
	}

	clear() {
		if(!this.model3D) return;
		this.object3D.remove(this.model3D);
		this.model3D = undefined;
	}

	async loadModel() {
		const model = this.model;
		let loading;
		switch(model.determineFileType()) {
			case FileType.Collada:
				loading = this.loadCollada(model); break;
			case FileType.Obj:
				loading = this.loadObjFiles(model); break;
			case FileType.Fbx:
				loading = this.loadFbx(model); break;
			default:
				return Promise.reject(new Error("Could not determine file type."));
		}
		const model3D = await loading;
		this.clear();
		this.object3D.add(model3D);
		this.model3D = model3D;
	}

	async loadObjFiles(xrModel3D: Model3DModel): Promise<Object3D> {
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
			loader.load(url, obj => {
				log.log("Loaded Obj", url);
				resolve(obj);
			}, progress => {

			}, reject);
		});

	}

	async loadCollada(xrModel3D: Model3DModel): Promise<Object3D> {
		let loader = new ColladaLoader();
		const url = xrModel3D.mainFile && xrModel3D.mainFile.url;

		log.log("Loading Collada", url);
		return new Promise((resolve, reject) => {
			if(!url) {
				reject(new Error("Model3DModel does not have a main file."));
				return;
			}
			loader.load(url, collada => {
				log.log("Loaded Collada", url);
				resolve(collada.scene);
			},() => {
				// progress not implemented yet
			},reject);
		});
	}

	async loadFbx(xrModel3D: Model3DModel): Promise<Object3D> {
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
				resolve(fbx);
			},() => {
				// progress not implemented yet
			}, reject);
		});
	}
}
