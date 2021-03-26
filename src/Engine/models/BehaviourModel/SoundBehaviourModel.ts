import BehaviourModel from '@/Engine/models/BehaviourModel';
import FileModel from "@/Engine/models/FileModel";
import {injectable, property} from "mozel";


@injectable()
export default class SoundBehaviourModel extends BehaviourModel {
	static get type() { return 'SoundBehaviour' }

	@property(FileModel)
	file?:FileModel;
}
