import BehaviourModel from '@examples/game-engine/models/BehaviourModel';

import TweenStepModel from "./TweenBehaviourModel/TweenStepModel";
import {Collection, collection, property, required} from "mozel";

// TODO: add loop and delay (they used to be there)

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
