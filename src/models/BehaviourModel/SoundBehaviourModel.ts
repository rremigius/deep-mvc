import BehaviourModel from '../BehaviourModel';

import {injectableModel, property} from "@common/classes/Model/Model";

import Log from "@/log';
import FileModel from "../FileModel";

const log = Log.instance("BehaviourModel/Tween");


@injectableModel()
export default class SoundBehaviourModel extends BehaviourModel {
	static get type() { return 'SoundBehaviour' }

	@property(FileModel)
	file?:FileModel;
}
