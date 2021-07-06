"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PropertySync_1 = tslib_1.__importDefault(require("../PropertySync"));
class ComponentSlot extends PropertySync_1.default {
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
exports.default = ComponentSlot;
//# sourceMappingURL=ComponentSlot.js.map