"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactViewComponent = void 0;
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importDefault(require("react"));
const View_1 = tslib_1.__importDefault(require("../View"));
const react_dom_1 = tslib_1.__importDefault(require("react-dom"));
/**
 * React Component that can be wrapped in a View, containing convenient getters and methods to communicate with the
 * View instance. By default, watches the model's direct properties to re-render when they change.
 */
class ReactViewComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.watchers = [];
        this.unmountCallbacks = [];
    }
    /** Gets the connected View instance */
    get view() {
        return this.props.view;
    }
    /** Gets the Model on which the rendering should be based */
    get model() {
        return this.props.view.model;
    }
    /**
     * Safely watch an event, unregistering the callback when component gets unmounted.
     * @param {EventEmitter} event
     * @param {Function} callback
     */
    watchEvent(event, callback) {
        const listener = event.on(callback);
        this.addUnmountCallback(() => event.off(listener));
    }
    /**
     * Safely watch model property/path, unregistering the callback when the component gets unmounted.
     * @param {string|PropertySchema<T>|MozelSchema<T>} path		Path or schema of the property to watch.
     * @param {PropertyChangeHandler<T>} handler					To be called when the property changes.
     * @param {PropertyWatcherOptionsArgument} 	options
     * @param {boolean} 						options.deep		Fire when any child value of the property changes.
     * @param {number}							options.throttle	Number of ms during which the handler will be called
     * 																only once, even if any matching values changed
     * 																multiple times.
     */
    watch(path, handler, options) {
        const watcher = this.view.createWatcher(path, handler, options);
        this.watchers.push(watcher);
        return watcher;
    }
    /**
     * Register a function to be called when the component unmounts.
     * @param {Function} callback
     */
    addUnmountCallback(callback) {
        this.unmountCallbacks.push(callback);
    }
    /**
     * Registers watchers
     * @protected
     */
    onInitWatchers() {
        this.watch('*', () => {
            this.forceUpdate();
        });
    }
    componentDidMount() {
        this.onInitWatchers();
        for (let watcher of this.watchers) {
            this.model.$addWatcher(watcher);
        }
    }
    componentWillUnmount() {
        for (let watcher of this.watchers) {
            this.model.$removeWatcher(watcher);
        }
        for (let callback of this.unmountCallbacks) {
            callback();
        }
    }
    /**
     * Renders all ReactViews in a ComponentList as JSX Elements.
     * @param {ComponentList} components
     */
    renderChildren(components) {
        return components
            .filter(view => view instanceof ReactView)
            .map((view, key) => view.render(key));
    }
    /**
     * Renders a Component from a ComponentSlot as a JSX Element.
     * @param {ComponentSlot} component
     */
    renderChild(component) {
        if (!(component.current instanceof ReactView))
            return;
        return component.current.render();
    }
}
exports.ReactViewComponent = ReactViewComponent;
class ReactView extends View_1.default {
    getReactComponent() {
        throw new Error(`${this.static.name} does not have getReactComponent implemented.`);
    }
    render(key) {
        const Component = this.getReactComponent();
        return <Component view={this} key={key}/>;
    }
    onMount(container) {
        super.onMount(container);
        react_dom_1.default.render(this.render(), container);
    }
    onDismount() {
        super.onDismount();
        if (!this.container)
            return;
        react_dom_1.default.unmountComponentAtNode(this.container);
    }
}
exports.default = ReactView;
//# sourceMappingURL=ReactView.jsx.map