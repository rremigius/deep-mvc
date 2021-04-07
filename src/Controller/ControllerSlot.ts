import PropertySync from "@/Controller/PropertySync";
import Controller, {ControllerConstructor} from "@/Controller";
import Mozel from "mozel";
import {Constructor} from "validation-kit";
import ControllerFactory from "@/Controller/ControllerFactory";

type ControllerModel<C extends Controller> = C['model'];

export default class ControllerSlot<C extends Controller> extends PropertySync<ControllerModel<C>, C> {
	SyncType!:ControllerConstructor<C>; // TS: set in super constructor
	factory:ControllerFactory;

	constructor(parent:Controller, watchModel:Mozel, path:string, PropertyType:Constructor<ControllerModel<C>>, SyncType:ControllerConstructor<C>, factory:ControllerFactory) {
		super(parent, watchModel, path, PropertyType, SyncType);
		this.factory = factory;
	}

	protected syncValue(model:ControllerModel<C>) {
		if(this.current) {
			this.current.setParent(undefined);
		}
		if(!model) return undefined;
		const controller = this.factory.resolve<C>(model, this.SyncType, true);
		controller.setParent(this.parent);
		return controller;
	}
}
