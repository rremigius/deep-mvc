import ObjectController from "@examples/game-engine/controllers/ObjectController";
import ImageModel from "@examples/game-engine/models/ObjectModel/ImageModel";

export default class ImageController extends ObjectController {
	static Model = ImageModel;
	model!:ImageModel;
}
