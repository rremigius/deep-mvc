import PropertySync from "../PropertySync";
import Component, { ComponentConstructor } from "../Component";
import Mozel from "mozel";
import { Constructor } from "validation-kit";
import ComponentFactory from "../Component/ComponentFactory";
declare type ComponentModel<C extends Component> = C['model'];
export default class ComponentSlot<C extends Component> extends PropertySync<ComponentModel<C>, C> {
    SyncType: ComponentConstructor<C>;
    factory: ComponentFactory;
    parent: Component;
    constructor(parent: Component, watchModel: Mozel, path: string, PropertyType: Constructor<ComponentModel<C>>, SyncType: ComponentConstructor<C>, factory: ComponentFactory);
    /**
     * Syncs the current model to a Component output value.
     * @param {Mozel} model
     * @protected
     */
    protected modelToComponent(model: ComponentModel<C>): C | undefined;
}
export {};
