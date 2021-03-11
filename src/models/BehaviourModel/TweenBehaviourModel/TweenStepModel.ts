import Model, {property} from '@common/classes/Model/Model';

import Log from "@/log';
import GenericModel from "@/models/GenericModel";

const log = Log.instance("ObjectModel/Behaviour/Tween/Step");

export default class TweenStepModel extends Model {
	@property(Model)
	target?:Model;
	@property(String)
	targetPath?:string;
	@property(GenericModel)
	tweenProperties?:GenericModel;
	@property(Number)
	to?:number;
	@property(Number, {required: true, default: 1})
	duration!:number;
	@property(String)
	position?:string;
	@property(Boolean, {required: true, default: true})
	positionIsRelative!:boolean;
	@property(String, {required: true, default: 'Linear.easeNone'})
	ease!:string;

	defineData() {
		super.defineData();
	}
}
