import Model, {property, required, reference, GenericMozel} from "mozel";
import ComponentModel from "@examples/GameEngine/BaseComponentModel";

export default class ActionModel extends Model {
	static get type() { return 'Action' };

	@property(String, {required, default: 'start'})
	name!:string;

	@property(Model, {reference})
	target?:ComponentModel;

	@property(GenericMozel)
	input?:GenericMozel;
}
