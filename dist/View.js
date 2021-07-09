"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerRegistrySymbol = exports.ViewEvents = exports.ViewRightClickEvent = exports.ViewClickEvent = void 0;
const tslib_1 = require("tslib");
const Component_1 = tslib_1.__importStar(require("./Component"));
const log_1 = tslib_1.__importDefault(require("./log"));
const log = log_1.default.instance("view");
class ViewClickEvent extends Component_1.ComponentEvent {
}
exports.ViewClickEvent = ViewClickEvent;
class ViewRightClickEvent extends Component_1.ComponentEvent {
}
exports.ViewRightClickEvent = ViewRightClickEvent;
class ViewEvents extends Component_1.ComponentEvents {
    constructor() {
        super(...arguments);
        this.click = this.$event(ViewClickEvent);
        this.rightClick = this.$event(ViewRightClickEvent);
    }
}
exports.ViewEvents = ViewEvents;
exports.ControllerRegistrySymbol = Symbol.for("ControllerRegistrySymbol");
class View extends Component_1.default {
    get container() {
        return this._container;
    }
    onInit() {
        if (this.dependencies.isBound(exports.ControllerRegistrySymbol)) {
            this.controllerRegistry = this.dependencies.get(exports.ControllerRegistrySymbol);
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
    click(details) {
        log.info(`${this} clicked.`);
        const event = new ViewClickEvent(this, details);
        this.onClick(event);
        this.events.click.fire(new ViewClickEvent(this));
    }
    rightClick(details) {
        log.info(`${this} right-clicked.`);
        const event = new ViewRightClickEvent(this, details);
        this.onRightClick(event);
        this.events.rightClick.fire(event);
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
    onRightClick(event) { }
}
exports.default = View;
View.Events = ViewEvents;
//# sourceMappingURL=View.js.map