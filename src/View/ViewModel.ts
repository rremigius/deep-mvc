import Mozel, {Collection, collection, property, required} from "mozel";

export default class ViewModel extends Mozel {
	@property(String, {required, default: "View"})
	name!:string;

	@collection(ViewModel)
	children!:Collection<ViewModel>;

	@property(Boolean)
	selected?:boolean;
}
