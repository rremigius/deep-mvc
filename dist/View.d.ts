import Component, { ComponentConstructor, ComponentEvent, ComponentEvents } from "./Component";
import { Registry } from "mozel";
import ViewFactory from "./View/ViewFactory";
export declare class ViewClickEvent extends ComponentEvent<{}> {
}
export declare class ViewEvents extends ComponentEvents {
    click: import("./EventEmitter").default<ViewClickEvent>;
}
export declare const ControllerRegistrySymbol: unique symbol;
export default class View extends Component {
    _container?: HTMLElement;
    get container(): HTMLElement | undefined;
    events: ViewEvents;
    controller?: Component;
    controllerRegistry?: Registry<Component>;
    factory: ViewFactory;
    onInit(): void;
    findController<C extends Component>(ExpectedClass: ComponentConstructor<C>): C | undefined;
    requireController<C extends Component>(ExpectedClass: ComponentConstructor<C>): C;
    click(): void;
    resize(): void;
    dismount(): void;
    mount(container: HTMLElement): void;
    onMount(container: HTMLElement): void;
    onDismount(): void;
    onResize(width: number, height: number): void;
    onClick(event: ViewClickEvent): void;
}
