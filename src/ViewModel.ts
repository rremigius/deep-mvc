import ComponentModel from "@/ComponentModel";
import {Collection, collection, property, required} from "mozel";

export default class ViewModel extends ComponentModel {
	@property(String, {required, default: "View"})
	name!:string;

	@collection(ViewModel)
	children!:Collection<ViewModel>;
}
