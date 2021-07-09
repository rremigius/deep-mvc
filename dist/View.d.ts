import Component, { ComponentConstructor, ComponentEvent, ComponentEvents } from "./Component";
import { Registry } from "mozel";
import ViewFactory from "./View/ViewFactory";
export declare class ViewClickEvent extends ComponentEvent<{
    position: {
        x: number;
        y: number;
    };
}> {
}
export declare class ViewRightClickEvent extends ComponentEvent<{
    position: {
        x: number;
        y: number;
    };
}> {
}
export declare class ViewEvents extends ComponentEvents {
    click: import("./EventEmitter").default<ViewClickEvent>;
    rightClick: import("./EventEmitter").default<ViewRightClickEvent>;
}
export declare const ControllerRegistrySymbol: unique symbol;
export default class View extends Component {
    static Events: typeof ViewEvents;
    events: ViewEvents;
    _container?: HTMLElement;
    get container(): HTMLElement | undefined;
    controller?: Component;
    controllerRegistry?: Registry<Component>;
    factory: ViewFactory;
    onInit(): void;
    findController<C extends Component>(ExpectedClass: ComponentConstructor<C>): C | undefined;
    requireController<C extends Component>(ExpectedClass: ComponentConstructor<C>): C;
    click(details: {
        position: {
            x: number;
            y: number;
        };
    }): void;
    rightClick(details: {
        position: {
            x: number;
            y: number;
        };
    }): void;
    resize(): void;
    dismount(): void;
    mount(container: HTMLElement): void;
    onMount(container: HTMLElement): void;
    onDismount(): void;
    onResize(width: number, height: number): void;
    onClick(event: ViewClickEvent): void;
    onRightClick(event: ViewRightClickEvent): void;
}
