import ObjectModel from "@/models/ObjectModel";
import {injectableModel, property} from "@common/classes/Model/Model";
import Log from "@/log";
import File from "@/models/FileModel";
import {required} from "@common/utils";

const log = Log.instance("Scene/Object/Video");


@injectableModel()
export default class VideoModel extends ObjectModel {
	static get type() { return 'Video' };

	@property(Number, {required, default: 1})
	width!: number;

	@property(Number, {required, default: 1})
	height!: number;

	@property(File)
	file?: File;
}
