import Mozel, {property, required} from "mozel";

export default class ViewModel extends Mozel {
	@property(String, {required, default: "View"})
	name!:string;
}
