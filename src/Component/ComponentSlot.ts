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
	protected modelToComponent(model:ComponentModel<C>) {
		const current = this.getCurrent(false);
		if(current && !this.isReference) {
			current.setParent(undefined);
		}
		if(!model) return undefined;

		const component = this.factory.resolve<C>(model, this.SyncType, !this.isReference);
		if(!this.isReference) {
			if(!component) {
				throw new Error(`Could not resolve component for ${model.static.type} (${model.gid}).`);
			}
			component.setParent(this.parent);
		}
		return component;
	}
}
