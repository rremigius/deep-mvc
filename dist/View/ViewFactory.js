"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ComponentFactory_1 = tslib_1.__importDefault(require("../Component/ComponentFactory"));
const View_1 = require("../View");
/**
 * ComponentFactory that allows injecting another Component Registry that can be used by Views to retrieve their
 * corresponding Controller.
 */
class ViewFactory extends ComponentFactory_1.default {
    setControllerRegistry(registry) {
        this.localDependencies.bind(View_1.ControllerRegistrySymbol).toConstantValue(registry);
    }
}
exports.default = ViewFactory;
//# sourceMappingURL=ViewFactory.js.map