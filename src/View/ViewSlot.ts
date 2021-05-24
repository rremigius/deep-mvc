import PropertySync from "@/PropertySync";
import Mozel from "mozel";
import {Constructor} from "validation-kit";
import View, {ViewConstructor} from "../View";
import ViewFactory from "./ViewFactory";

type ViewModel<C extends View> = C['model'];

export default class ViewSlot<V extends View> extends PropertySync<ViewModel<V>, V> {
	SyncType!:ViewConstructor<V>; // TS: set in super constructor
	factory:ViewFactory;
	parent:View;

	constructor(parent:View, watchModel:Mozel, path:string, PropertyType:Constructor<ViewModel<V>>, SyncType:ViewConstructor<V>, factory:ViewFactory) {
		super(watchModel, path, PropertyType, SyncType);
		this.factory = factory;
		this.parent = parent;
	}

	protected syncValue(model:ViewModel<V>) {
		if(this.current) {
			this.current.setParent(undefined);
		}
		if(!model) return undefined;
		const view = this.factory.resolve<V>(model, this.SyncType, true);
		view.setParent(this.parent);
		return view;
	}
}
