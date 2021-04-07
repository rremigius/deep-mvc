import BehaviourModel from '@/Engine/models/BehaviourModel';
import FileModel from "@/Engine/models/FileModel";
import {property} from "mozel";

export default class SoundBehaviourModel extends BehaviourModel {
	static get type() { return 'SoundBehaviour' }

	@property(FileModel)
	file?:FileModel;
}
