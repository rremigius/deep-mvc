import {collection, Collection, property, required} from "mozel"
import TriggerModel, {UnknownTriggerModel} from "./TriggerModel";
import {EngineType} from "@examples/game-engine/viewer-settings";
import ObjectModel from "@examples/game-engine/models/ObjectModel";
import BaseComponentModel from "../BaseComponentModel";

export default class SceneModel extends BaseComponentModel {
	static get type() { return 'Scene' };

	@property(String, {required})
	description!:string;

	@property(String, {required, default: EngineType.PLAIN}) // TODO: accept enum as runtime type
	engine!:EngineType;

	@property(String, {required, default: 'patt.hiro'})
	marker!:string;

	@collection(TriggerModel)
	triggers!:Collection<UnknownTriggerModel>;

	@collection(ObjectModel)
	objects!:Collection<ObjectModel>;
}
