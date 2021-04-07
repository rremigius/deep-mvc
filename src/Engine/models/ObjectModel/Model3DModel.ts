import ObjectModel from "@/Engine/models/ObjectModel";
import {Collection, collection} from "mozel";
import Log from "@/log";
import FileModel from "@/Engine/models/FileModel";

export enum FileType {
	Collada = 'collada',
	Obj = 'obj',
	Fbx = 'fbx',
}

export default class Model3DModel extends ObjectModel {
	static get type() { return 'Model3D' }

	@collection(FileModel)
	files!:Collection<FileModel>;

	@collection(String)
	clickableMeshes!:Collection<string>;

	/**
	 * Determine the file type from the files
	 */
	determineFileType() {
		if(!this.mainFile) return;

		const fileUrl = this.mainFile.url;
		switch (fileUrl.toLowerCase().substr(-3)){
		case "dae":
			return FileType.Collada;
		case "obj":
			return FileType.Obj;
		case "fbx":
			return FileType.Fbx;
		}

	}
	get mainFile() {
		return this.files.get(0);
	}
}
