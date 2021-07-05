import ComponentFactory from "@/Component/ComponentFactory";
import { ControllerRegistrySymbol } from "../View";
/**
 * ComponentFactory that allows injecting another Component Registry that can be used by Views to retrieve their
 * corresponding Controller.
 */
export default class ViewFactory extends ComponentFactory {
    setControllerRegistry(registry) {
        this.localDependencies.bind(ControllerRegistrySymbol).toConstantValue(registry);
    }
}
//# sourceMappingURL=ViewFactory.js.map