import ComponentFactory from "@/Component/ComponentFactory";
import { Registry } from "mozel";
import Component from "../Component";
/**
 * ComponentFactory that allows injecting another Component Registry that can be used by Views to retrieve their
 * corresponding Controller.
 */
export default class ViewFactory extends ComponentFactory {
    setControllerRegistry(registry: Registry<Component>): void;
}
