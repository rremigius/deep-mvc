import BehaviourModel from '../BehaviourModel';

import TweenStepModel from "./TweenBehaviourModel/TweenStepModel";
import {collection, injectableModel, property} from "@common/classes/Model/Model";
import Collection from "@common/classes/Model/Collection";

import Log from "@/log';
import {required} from "@common/utils";

const log = Log.instance("BehaviourModel/Tween");

// TODO: add loop and delay (they used to be there)

@injectableModel()
export default class TweenBehaviourModel extends BehaviourModel {
	static get type() { return 'TweenBehaviour' }

	@property(Number)
	repeat?:number;

	@property(Number)
	repeatDelay?:number;

	@property(Boolean, {required})
	yoyo!:boolean;

	@collection(TweenStepModel)
	steps!:Collection<TweenStepModel>;
}
