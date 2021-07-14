import Component from "./Component";
import ComponentFactory from "./Component/ComponentFactory";
import EventBus from "./EventBus";
import ViewFactory from "./View/ViewFactory";
import {component} from "./Component";
import {components} from "./Component";
import {EventEmitter, EventListener} from "event-interface-mixin";

export default Component;
export {ComponentFactory, EventBus, EventEmitter, EventListener, ViewFactory, component, components}
