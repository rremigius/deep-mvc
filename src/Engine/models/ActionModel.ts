import Model, {property, required, reference} from "mozel";
import ControllerModel from "@/ControllerModel";

export default class ActionModel extends Model {
	static get type() { return 'Action' };

	@property(Model, {reference})
	target?:ControllerModel;

	@property(String, {required, default: 'start'})
	name!:string;
}
