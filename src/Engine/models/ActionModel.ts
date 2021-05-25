import Model, {property, required, reference} from "mozel";
import ComponentModel from "@/ComponentModel";

export default class ActionModel extends Model {
	static get type() { return 'Action' };

	@property(Model, {reference})
	target?:ComponentModel;

	@property(String, {required, default: 'start'})
	name!:string;
}
