import Log from "@/log";
import Mozel, {GenericMozel, property} from "mozel";

export default class TweenStepModel extends Mozel {
	@property(Mozel)
	target?:Mozel;
	@property(String)
	targetPath?:string;
	@property(GenericMozel)
	tweenProperties?:GenericMozel;
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
}
