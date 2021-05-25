import ObjectController from "@/Engine/controllers/ViewController/ObjectController";
import ImageModel from "@/Engine/models/ObjectModel/ImageModel";

export default class ImageController extends ObjectController {
	static ModelClass = ImageModel;
	model!:ImageModel;
}
