import ThreeView from "@/Engine/views/threejs/ThreeView";
import ObjectModel from "@/Engine/models/ObjectModel";

export default class ThreeObject extends ThreeView {
	static Model = ObjectModel;
	model!:ObjectModel;
}
