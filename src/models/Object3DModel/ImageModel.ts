import ObjectModel from "@/models/ObjectModel";
import {injectable, property} from "mozel";
import Log from "@/log";
import FileModel from "@/models/FileModel";
import {required} from "mozel";

const log = Log.instance("Scene/ObjectModel/ImageModel");

@injectable()
export default class ImageModel extends ObjectModel {
	static get type() { return 'Image' };

	log = log;

	@property(Number, {required, default: 1})
	width!:number;

	@property(Number, {required, default: 1})
	height!:number;

	@property(FileModel)
	file?:FileModel;
}
