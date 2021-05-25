import ObjectModel from "@/Engine/models/ObjectModel";
import Log from "@/log";
import File from "@/Engine/models/FileModel";
import {property, required} from "mozel";

export default class VideoModel extends ObjectModel {
	static get type() { return 'Video' };

	@property(Number, {required, default: 1})
	width!: number;

	@property(Number, {required, default: 1})
	height!: number;

	@property(File)
	file?: File;

	/* State */

	@property(Boolean)
	playing?:boolean;

	@property(Number)
	time?:number;
}
