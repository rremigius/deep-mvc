import PropertySync from "@/Controller/PropertySync";
import Controller, {ControllerConstructor} from "@/Controller";
import ControllerModel from "@/models/ControllerModel";
import Mozel from "mozel";
import {Constructor} from "validation-kit";
import ControllerFactory from "@/Controller/ControllerFactory";

export default class ControllerSync<P extends ControllerModel, C extends Controller> extends PropertySync<P, C> {
	SyncType!:ControllerConstructor<C>; // TS: set in super constructor
	factory:ControllerFactory;

	constructor(watchModel:Mozel, path:string, PropertyType:Constructor<P>, SyncType:ControllerConstructor<C>, factory:ControllerFactory) {
		super(watchModel, path, PropertyType, SyncType);
		this.factory = factory;
	}

	protected syncValue(model:P, createNonExisting:boolean) {
		if(!model) return undefined;
		return this.factory.resolve<C>(model, this.SyncType, createNonExisting);
	}
}
