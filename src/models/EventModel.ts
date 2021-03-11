import Model, {property, reference, required} from "mozel";
import ControllerModel from "@/models/ControllerModel";

export default class EventModel extends Model {
	static get type() { return 'Event' };

	@property(ControllerModel, {reference})
	source?:ControllerModel;

	@property(String, {required})
	name!:string;
}
