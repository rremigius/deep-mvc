import {collection, Collection, property, required} from "mozel"
import ObjectModel from './ObjectModel';
import ControllerModel from "@/models/ControllerModel";

import {EngineType} from "@/viewer-settings";
import TriggerModel, {UnknownTriggerModel} from "./TriggerModel";
import {ControllerAction, ControllerEvent} from "@/Controller";

export default class SceneModel extends ControllerModel {
	static get type() { return 'Scene' };

	@property(String, {required})
	name!:string;

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
