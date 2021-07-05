import Component, { ComponentEvent, ComponentEvents } from "./Component";
import Log from "@/log";
const log = Log.instance("view");
export class ViewClickEvent extends ComponentEvent {
}
export class ViewEvents extends ComponentEvents {
    constructor() {
        super(...arguments);
        this.click = this.$event(ViewClickEvent);
    }
}
export const ControllerRegistrySymbol = Symbol.for("ControllerRegistrySymbol");
export default class View extends Component {
    constructor() {
        super(...arguments);
        this.events = new ViewEvents();
    }
    get container() {
        return this._container;
    }
    onInit() {
        if (this.dependencies.isBound(ControllerRegistrySymbol)) {
            this.controllerRegistry = this.dependencies.get(ControllerRegistrySymbol);
        }
        super.onInit();
    }
    findController(ExpectedClass) {
        if (!this.controllerRegistry)
            return;
        const component = this.controllerRegistry.byGid(this.model.gid);
        if (component && !(component instanceof ExpectedClass)) {
            throw new Error(`View '${this.static.name}' expected component of type '${ExpectedClass.name}', found '${component.static.name}' instead.`);
        }
        return component;
    }
    requireController(ExpectedClass) {
        const component = this.findController(ExpectedClass);
        if (!component) {
            throw new Error(`No Controller found for View '${this.static.name} (GID ${this.model.gid}).`);
        }
        return component;
    }
    click() {
        log.info(`${this} clicked.`);
        const event = new ViewClickEvent(this, {});
        this.onClick(event);
        this.events.click.fire(new ViewClickEvent(this));
    }
    resize() {
        if (!this.container)
            return;
        this.onResize(this.container.clientWidth, this.container.clientHeight);
    }
    dismount() {
        if (!this._container)
            return;
        this.onDismount();
    }
    mount(container) {
        if (container === this._container)
            return;
        this._container = container;
        this.onMount(container);
    }
    /* For override */
    onMount(container) { }
    onDismount() { }
    onResize(width, height) { }
    onClick(event) { }
}
//# sourceMappingURL=View.js.map