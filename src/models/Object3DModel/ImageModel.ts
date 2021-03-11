import ObjectModel from "@/models/ObjectModel";
import {injectableModel, property} from "@common/classes/Model/Model";
import Log from "@/log";
import FileModel from "@/models/FileModel";
import {required} from "@common/utils";

const log = Log.instance("Scene/ObjectModel/ImageModel");

@injectableModel()
export default class ImageModel extends ObjectModel {
	static get type() { return 'Image' };

	@property(Number, {required, default: 1})
	width!:number;

	@property(Number, {required, default: 1})
	height!:number;

	@property(FileModel)
	file?:FileModel;
}
