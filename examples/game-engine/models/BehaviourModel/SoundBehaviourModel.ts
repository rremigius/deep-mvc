import BehaviourModel from '@examples/game-engine/models/BehaviourModel';
import FileModel from "@examples/game-engine/models/FileModel";
import {property} from "mozel";

export default class SoundBehaviourModel extends BehaviourModel {
	static get type() { return 'SoundBehaviour' }

	@property(FileModel)
	file?:FileModel;
}
