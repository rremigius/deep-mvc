import PropertySync from "@/PropertySync";
export default class ComponentSlot extends PropertySync {
    constructor(parent, watchModel, path, PropertyType, SyncType, factory) {
        super(watchModel, path, PropertyType, SyncType);
        this.factory = factory;
        this.parent = parent;
    }
    /**
     * Syncs the current model to a Component output value.
     * @param {Mozel} model
     * @protected
     */
    syncValue(model) {
        if (this.current && !this.isReference) {
            this.current.setParent(undefined);
        }
        if (!model)
            return undefined;
        const component = this.factory.resolve(model, this.SyncType, true);
        if (!this.isReference) {
            component.setParent(this.parent);
        }
        return component;
    }
}
//# sourceMappingURL=ComponentSlot.js.map