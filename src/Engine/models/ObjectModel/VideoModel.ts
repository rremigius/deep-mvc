import ObjectModel from "@/Engine/models/ObjectModel";
import Log from "@/log";
import File from "@/Engine/models/FileModel";
import {injectable, property, required} from "mozel";

const log = Log.instance("scene/object/video");

@injectable()
export default class VideoModel extends ObjectModel {
	static get type() { return 'Video' };

	log = log;

	@property(Number, {required, default: 1})
	width!: number;

	@property(Number, {required, default: 1})
	height!: number;

	@property(File)
	file?: File;
}
