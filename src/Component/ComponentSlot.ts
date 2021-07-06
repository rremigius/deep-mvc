import PropertySync from "../PropertySync";
import Component, {ComponentConstructor} from "../Component";
import Mozel from "mozel";
import {Constructor} from "validation-kit";
import ComponentFactory from "../Component/ComponentFactory";

type ComponentModel<C extends Component> = C['model'];

export default class ComponentSlot<C extends Component> extends PropertySync<ComponentModel<C>, C> {
	SyncType!:ComponentConstructor<C>; // TS: set in super constructor
	factory:ComponentFactory;
	parent:Component;

	constructor(parent:Component, watchModel:Mozel, path:string, PropertyType:Constructor<ComponentModel<C>>, SyncType:ComponentConstructor<C>, factory:ComponentFactory) {
		super(watchModel, path, PropertyType, SyncType);
		this.factory = factory;
		this.parent = parent;
	}

	/**
	 * Syncs the current model to a Component output value.
	 * @param {Mozel} model
	 * @protected
	 */
	protected syncValue(model:ComponentModel<C>) {
		if(this.current && !this.isReference) {
			this.current.setParent(undefined);
		}
		if(!model) return undefined;
		const component = this.factory.resolve<C>(model, this.SyncType, true);
		if(!this.isReference) {
			component.setParent(this.parent);
		}
		return component;
	}
}
