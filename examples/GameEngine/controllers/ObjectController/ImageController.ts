import ObjectController from "@examples/GameEngine/controllers/ObjectController";
import ImageModel from "@examples/GameEngine/models/ObjectModel/ImageModel";

export default class ImageController extends ObjectController {
	static Model = ImageModel;
	model!:ImageModel;
}
