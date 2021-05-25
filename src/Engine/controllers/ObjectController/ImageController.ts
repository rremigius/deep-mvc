import ObjectController from "@/Engine/controllers/ObjectController";
import ImageModel from "@/Engine/models/ObjectModel/ImageModel";

export default class ImageController extends ObjectController {
	static Model = ImageModel;
	model!:ImageModel;
}
