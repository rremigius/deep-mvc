import Model, {property, reference, required} from "mozel";
import ComponentModel from "@examples/GameEngine/BaseComponentModel";

export default class EventModel extends Model {
	static get type() { return 'Event' };

	@property(ComponentModel, {reference})
	source?:ComponentModel;

	@property(String, {required})
	name!:string;
}
