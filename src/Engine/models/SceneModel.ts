import {collection, Collection, property, required} from "mozel"
import ObjectModel from './ObjectModel';
import TriggerModel, {UnknownTriggerModel} from "./TriggerModel";
import {EngineType} from "@/Engine/viewer-settings";
import ViewModel from "@/ViewModel";

export default class SceneModel extends ViewModel {
	static get type() { return 'Scene' };

	@property(String, {required})
	description!:string;

	@property(String, {required, default: EngineType.PLAIN}) // TODO: accept enum as runtime type
	engine!:EngineType;

	@property(String, {required, default: 'patt.hiro'})
	marker!:string;

	@collection(ObjectModel)
	objects!:Collection<ObjectModel>;

	@collection(TriggerModel)
	triggers!:Collection<UnknownTriggerModel>;
}
