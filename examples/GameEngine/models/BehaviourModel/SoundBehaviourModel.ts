import BehaviourModel from '@examples/GameEngine/models/BehaviourModel';
import FileModel from "@examples/GameEngine/models/FileModel";
import {property} from "mozel";

export default class SoundBehaviourModel extends BehaviourModel {
	static get type() { return 'SoundBehaviour' }

	@property(FileModel)
	file?:FileModel;
}
