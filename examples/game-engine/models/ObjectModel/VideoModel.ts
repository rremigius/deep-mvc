import ObjectModel from "@examples/game-engine/models/ObjectModel";
import Log from "@/log";
import File from "@examples/game-engine/models/FileModel";
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
