"use strict";
var Component_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.components = exports.component = exports.ComponentActions = exports.ComponentEnableAction = exports.ComponentEvents = exports.ComponentDisabledEvent = exports.ComponentEnabledEvent = exports.ComponentEvent = exports.ComponentAction = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const ComponentFactory_1 = tslib_1.__importDefault(require("./Component/ComponentFactory"));
const log_1 = tslib_1.__importDefault(require("./log"));
const deep_loader_1 = tslib_1.__importDefault(require("deep-loader"));
const ComponentList_1 = tslib_1.__importDefault(require("./Component/ComponentList"));
const ComponentSlot_1 = tslib_1.__importDefault(require("./Component/ComponentSlot"));
const mozel_1 = tslib_1.__importStar(require("mozel"));
const EventBus_1 = tslib_1.__importDefault(require("./EventBus"));
const lodash_1 = require("lodash");
const Property_1 = tslib_1.__importDefault(require("mozel/dist/Property"));
const validation_kit_1 = require("validation-kit");
const log_control_1 = require("log-control");
const PropertyWatcher_1 = tslib_1.__importDefault(require("mozel/dist/PropertyWatcher"));
const event_interface_mixin_1 = tslib_1.__importStar(require("event-interface-mixin"));
const log = log_1.default.instance("component");
/**
 * Base class for Component Actions.
 */
class ComponentAction {
    /**
     * Payload of the event.
     * @param {T} data
     */
    constructor(data) {
        this.data = data;
    }
}
exports.ComponentAction = ComponentAction;
/**
 * Base class for Component Events
 */
class ComponentEvent {
    /**
     *
     * @param {Component} origin	The Component from which this event originates.
     * @param {T} data				The event payload.
     */
    constructor(origin, data = {}) {
        this.origin = origin;
        this.data = data;
    }
}
exports.ComponentEvent = ComponentEvent;
/**
 * Fires when the Component gets enabled.
 */
class ComponentEnabledEvent extends ComponentEvent {
}
exports.ComponentEnabledEvent = ComponentEnabledEvent;
/**
 * Fires when the Component gets disabled.
 */
class ComponentDisabledEvent extends ComponentEvent {
}
exports.ComponentDisabledEvent = ComponentDisabledEvent;
class ComponentEvents extends event_interface_mixin_1.default {
    constructor() {
        super(true);
        this.enabled = this.$event(ComponentEnabledEvent);
        this.disabled = this.$event(ComponentDisabledEvent);
    }
}
exports.ComponentEvents = ComponentEvents;
/**
 * Action to enable/disable the Component.
 */
class ComponentEnableAction extends ComponentAction {
}
exports.ComponentEnableAction = ComponentEnableAction;
class ComponentActions extends event_interface_mixin_1.default {
    constructor() {
        super(...arguments);
        this.enable = this.$action(ComponentEnableAction);
    }
    $action(ActionClass) {
        return this.$event(ActionClass);
    }
}
exports.ComponentActions = ComponentActions;
// DECORATORS
/**
 * Defines a ComponentSlot for the current Component class, to instantiate or find the child component corresponding
 * to the model at the given path.
 * @param modelPath					Path of the model based on which the child component should be resolved.
 * 									Can be a string, or a Schema provided by `schema(Model)`.
 * @param ExpectedComponentClass	Component class that is expected to be instantiated (runtime verification).
 */
function component(modelPath, ExpectedComponentClass) {
    return function (target, propertyName) {
        if (!lodash_1.isString(modelPath))
            modelPath = modelPath.$path;
        target.static.defineComponentSlot(propertyName, modelPath, ExpectedComponentClass);
    };
}
exports.component = component;
/**
 * Defines a ComponentList for the current Component class, to instantiate or find the child components corresponding
 * to the model at the given path.
 * @param modelPath					Path of the model based on which the child components should be resolved.
 * 									Can be a string, or a Schema provided by `schema(Model)`.
 * @param ExpectedComponentClass	Component class that is expected to be instantiated (runtime verification).
 */
function components(modelPath, ExpectedComponentClass) {
    return function (target, propertyName) {
        if (!lodash_1.isString(modelPath))
            modelPath = modelPath.$path;
        target.static.defineComponentList(propertyName, modelPath, ExpectedComponentClass);
    };
}
exports.components = components;
/**
 * Base Component class. Designed to be a functional counterpart of a data model.
 */
let Component = Component_1 = class Component {
    constructor(
    // using LazyServiceIdentifier to prevent circular dependency problem
    model, 
    // using LazyServiceIdentifier to prevent circular dependency problem
    componentFactory, registry, eventBus, dependencies) {
        this.componentSlotDefinitions = {};
        this.componentListDefinitions = {};
        this.allChildren = {};
        this.eventListeners = [];
        this.parentEnabled = true;
        this._enabled = true;
        this._started = false;
        if (!this.static.Model || !(model instanceof this.static.Model)) {
            throw new Error(`Invalid Model provided to Component '${this.static.name}'.`);
        }
        this.model = model;
        this.gid = model.gid;
        this.factory = componentFactory;
        this.registry = registry;
        this.eventBus = eventBus;
        this.dependencies = dependencies;
        this.enabledProperty = 'enabled';
        this.initialized = false;
        this.watchers = [];
        this.permanentWatchers = [];
        this.slots = {};
        this.lists = {};
        const name = this.toString();
        this.loader = new deep_loader_1.default(name);
        this.loader.log.setLevel(log_control_1.LogLevel.WARN);
        this.model.$events.destroyed.on(event => this.onModelDestroyed());
        this.setupActionsAndEvents();
        this.initClassDefinitions();
        this.onInit();
        this.initialized = true;
    }
    /**
     * Creates a Component based on the given model, and instantiates all necessary dependencies.
     * Current Component class is pre-registered in the factory.
     * @param {Mozel} model
     */
    static create(model) {
        const factory = this.createFactory();
        factory.register(this);
        return factory.create(model, this);
    }
    /**
     * Creates a ComponentFactory.
     */
    static createFactory() {
        return new ComponentFactory_1.default();
    }
    /**
     * Gets the definitions for ComponentSlots for this class.
     */
    static get classComponentSlotDefinitions() {
        // Override _classPropertyDefinitions so this class has its own set and it will not add its properties to its parent
        if (!this.hasOwnProperty('_classComponentSlotDefinitions')) {
            this._classComponentSlotDefinitions = [];
        }
        return this._classComponentSlotDefinitions;
    }
    /**
     * Gets the definitions for ComponentLists for this class.
     */
    static get classComponentListDefinitions() {
        // Override _classPropertyDefinitions so this class has its own set and it will not add its properties to its parent
        if (!this.hasOwnProperty('_classComponentListDefinitions')) {
            this._classComponentListDefinitions = [];
        }
        return this._classComponentListDefinitions;
    }
    /**
     * Defines a ComponentSlot for the current Component class, to instantiate or find the child component corresponding
     * to the model at the given path.
     * @param {string} property			Name of the property by which the ComponentSlot can be accessed.
     * @param modelPath					Path of the model based on which the child component should be resolved..
     * 									Can be a string, or a Schema provided by `schema(Model)`.
     * @param ExpectedComponentClass	Component class that is expected to be instantiated (runtime verification).
     */
    static defineComponentSlot(property, modelPath, ExpectedComponentClass) {
        this.classComponentSlotDefinitions.push({ property, modelPath, ExpectedComponentClass });
    }
    /**
     * Defines a ComponentList for the current Component class, to instantiate or find the child components corresponding
     * to the model at the given path.
     * @param {string} property			Name of the property by which the ComponentList can be accessed.
     * @param modelPath					Path of the model based on which the child components should be resolved.
     * 									Can be a string, or a Schema provided by `schema(Model)`.
     * @param ExpectedComponentClass	Component class that is expected to be instantiated (runtime verification).
     */
    static defineComponentList(property, modelPath, ExpectedComponentClass) {
        this.classComponentListDefinitions.push({ property, modelPath, ExpectedComponentClass });
    }
    /** The parent Component to which this Component is a direct child */
    get parent() { return this._parent; }
    get static() {
        return this.constructor;
    }
    get enabled() {
        // If model has 'enabled' property, we use that. Otherwise, we use the Component's own `_enabled` property.
        const thisEnabled = this.hasEnabledPropertyInModel()
            ? this.model.$get(this.enabledProperty) !== false
            : this._enabled;
        return this.started && thisEnabled && this.parentEnabled;
    }
    /** Whether or not the Component has been started (with the start() method)*/
    get started() {
        return this._started;
    }
    /** Component class name */
    get name() {
        return this.static.name;
    }
    /** Model name */
    get modelName() {
        return this.model.static.name;
    }
    /** Returns the promise for initial loading */
    get loading() {
        return this.loader.wait();
    }
    /**
     * Tells whether or not the model has the property that represents the enabled state of the Component.
     * @return {boolean} True if the property exists on the model.
     */
    hasEnabledPropertyInModel() {
        return this.model.$has(this.enabledProperty);
    }
    collectClassDefinitions() {
        const _collectClassDefinitions = (Class) => {
            // First collect parent class definitions
            if (Class !== Component_1) {
                _collectClassDefinitions(Object.getPrototypeOf(Class));
            }
            // Then collect this class' definitions (allow override)
            Class.classComponentSlotDefinitions.forEach(definition => {
                this.componentSlotDefinitions[definition.property] = definition;
            });
            Class.classComponentListDefinitions.forEach(definition => {
                this.componentListDefinitions[definition.property] = definition;
            });
        };
        _collectClassDefinitions(this.static);
    }
    initClassDefinitions() {
        // First collect all definitions
        this.collectClassDefinitions();
        for (let property in this.componentSlotDefinitions) {
            const definition = this.componentSlotDefinitions[property];
            this[definition.property] = this.setupSubComponent(definition.modelPath, definition.ExpectedComponentClass);
        }
        for (let property in this.componentListDefinitions) {
            const definition = this.componentListDefinitions[property];
            this[definition.property] = this.setupSubComponents(definition.modelPath, definition.ExpectedComponentClass);
        }
    }
    eachComponentSlot(callback) {
        for (let path in this.slots) {
            callback(this.slots[path]);
        }
    }
    eachComponentList(callback) {
        for (let path in this.lists) {
            callback(this.lists[path]);
        }
    }
    getComponentSlot(path) {
        return this.slots[path];
    }
    getComponentList(path) {
        return this.lists[path];
    }
    /**
     * Initializes the Component. Called from the constructor.
     * @protected
     */
    onInit() {
        this.actions.enable.on(action => this.enable(action.data.enable));
    }
    /**
     * Sets up the actions and events as defined by the static properties `Actions` and `Events`.
     */
    setupActionsAndEvents() {
        this.events = new this.static.Events();
        this.actions = new this.static.Actions();
    }
    /**
     * Calls an action on the Component by its name. Will throw an error if the action does not exist.
     * @param {string} name		The name of the action (usually the Action class name).
     * @param payload			The payload required by the specified action.
     */
    callAction(name, payload) {
        let action;
        try {
            action = this.actions.$get(name);
        }
        catch (e) {
            throw new Error(`Unknown action '${name}' on ${this.static.name}.`);
        }
        const ActionClass = action.type;
        if (!validation_kit_1.isSubClass(ActionClass, ComponentAction)) {
            throw new Error("Trigger action is not a ComponentAction.");
        }
        this.actions.$fire(name, new ActionClass(payload));
    }
    /**
     * Creates a model watcher at the given path, without starting adding it to the Model or starting it.
     * Will fire immediately once added to the Model.
     * @param {string|PropertySchema<T>|MozelSchema<T>} path		Path or schema of the property to watch.
     * @param {PropertyChangeHandler<T>} handler					To be called when the property changes.
     * @param {PropertyWatcherOptionsArgument} 	options
     * @param {boolean} 						options.deep		Fire when any child value of the property changes.
     * @param {number}							options.throttle	Number of ms during which the handler will be called
     * 																only once, even if any matching values changed
     * 																multiple times.
     */
    createWatcher(path, handler, options) {
        const finalPath = lodash_1.isString(path) ? path : path.$path;
        const allOptions = {
            ...options,
            ...{
                path: finalPath,
                handler: handler,
                immediate: true
            }
        };
        return new PropertyWatcher_1.default(this.model, allOptions);
    }
    /**
     * Watches model at the given path (only when the Component is enabled).
     * Will always use `immediate` option, so will check for changes every time the Component gets enabled.
     * @param {string|PropertySchema<T>|MozelSchema<T>} path		Path or schema of the property to watch.
     * @param {PropertyChangeHandler<T>} handler					To be called when the property changes.
     * @param {PropertyWatcherOptionsArgument} 	options
     * @param {boolean} 						options.deep		Fire when any child value of the property changes.
     * @param {number}							options.throttle	Number of ms during which the handler will be called
     * 																only once, even if any matching values changed
     * 																multiple times.
     */
    watch(path, handler, options) {
        const watcher = this.createWatcher(path, handler, options);
        this.watchers.push(watcher);
        return watcher;
    }
    /**
     * Watches model at the given path, whether the Component is enabled or disabled, until the Component is destroyed.
     * Will start watching immediately, and fire first time when this method is called.
     * @param {string|PropertySchema<T>|MozelSchema<T>} path		Path or schema of the property to watch.
     * @param {PropertyChangeHandler<T>} handler					To be called when the property changes.
     * @param {PropertyWatcherOptionsArgument} 	options
     * @param {boolean} 						options.deep		Fire when any child value of the property changes.
     * @param {number}							options.throttle	Number of ms during which the handler will be called
     * 																only once, even if any matching values changed
     * 																multiple times.
     */
    watchAlways(path, handler, options) {
        const watcher = this.createWatcher(path, handler, options);
        this.permanentWatchers.push(watcher);
        this.model.$addWatcher(watcher);
        return watcher;
    }
    /**
     * Sets the parentof this Component.
     * @param {Component} parent
     */
    setParent(parent) {
        this._parent = parent;
        this.updateEnabledState();
        this.onSetParent(parent);
    }
    /**
     * Finds the first parent up the hierarchy that matches the given conditions.
     * @param {(component:Component)=>boolean}	criteria	Function to evaluated whether a component matches the conditions.
     */
    findParent(criteria) {
        if (criteria(this)) {
            return this;
        }
        if (!this._parent)
            return;
        return this._parent.findParent(criteria);
    }
    /**
     * Gets the root Component of the hierarchy.
     */
    getRootComponent() {
        if (!this._parent)
            return this;
        return this._parent.getRootComponent();
    }
    /**
     * Generates and log an Error.
     * @param args	Any number of arguments can be logged; only the first argument will be used as the Error message.
     * @protected
     */
    error(...args) {
        log.error(...args);
        return new Error("" + args[0]);
    }
    setupSubComponent(modelPath, ComponentClass) {
        if (modelPath instanceof Property_1.default) {
            modelPath = modelPath.getPathFrom(this.model);
        }
        const sync = new ComponentSlot_1.default(this, this.model, modelPath, ComponentClass.Model, ComponentClass, this.factory);
        sync.startWatching();
        const typedSlot = sync;
        this.allChildren[modelPath] = typedSlot;
        this.slots[modelPath] = typedSlot;
        return sync;
    }
    setupSubComponents(modelPath, ComponentClass) {
        if (modelPath instanceof Property_1.default) {
            modelPath = modelPath.getPathFrom(this.model);
        }
        const list = new ComponentList_1.default(this, this.model, modelPath, ComponentClass.Model, ComponentClass, this.factory);
        list.startWatching();
        const typedList = list;
        this.allChildren[modelPath] = typedList;
        this.lists[modelPath] = typedList;
        return list;
    }
    /**
     * Listens to an event from the given source by its event name.
     * @param {Component} source
     * @param {string} eventName
     * @param {callback} callback
     */
    listenToEventName(source, eventName, callback) {
        const event = source.$get(eventName);
        this.listenTo(event, callback);
    }
    /**
     * Starts listening to an event of the target EventEmitterr, storing the callback locally to be destroyed and
     * unsubscribed when the Component is destroyed.
     * @param {EventEmitter<T>>} event
     * @param {callback<T>} callback
     */
    listenTo(event, callback) {
        const eventListener = new event_interface_mixin_1.EventListener(event, callback);
        eventListener.start();
        // TS: we can't use the event listener callbacks in this class anyway
        this.eventListeners.push(eventListener);
        return eventListener;
    }
    /**
     * Runs the given callback on all children, whether in ComponentSlots or ComponentLists.
     * @param {Function} callback	Callback that takes the Component.
     * @param [includeReferences]	If set to `true`, will also run the callback on Components that are references.
     * 								Defaults to `false`.
     */
    forEachChild(callback, includeReferences = false) {
        for (let path in this.allChildren) {
            const child = this.allChildren[path];
            if (!includeReferences && child.isReference)
                continue;
            if (child instanceof ComponentSlot_1.default) {
                const component = child.current;
                if (!component)
                    continue;
                callback(component);
            }
            else if (child instanceof ComponentList_1.default) {
                child.each(callback);
            }
        }
    }
    /**
     * Resolves all references of defined ComponentSlots and ComponentLists.
     */
    resolveReferences() {
        for (let path in this.allChildren) {
            const sync = this.allChildren[path];
            sync.resolveReferences();
        }
        this.forEachChild(component => component.resolveReferences());
    }
    /**
     * Performs initial asynchronous loading of the Component.
     */
    async load() {
        const start = Date.now();
        log.info(`${this} loading...`);
        let promise = this.onLoad();
        this.loader.start('main', undefined, promise);
        let i = 0;
        this.forEachChild((child) => {
            let promise = child.load();
            this.loader.start('child-' + (i++), undefined, promise);
        });
        try {
            await this.loader.wait(undefined, 10000);
            const end = Date.now();
            log.info(`${this} loaded (${end - start} ms).`);
        }
        catch (e) {
            log.error(`${this} loading failed.`, e);
            throw e;
        }
    }
    /**
     * Starts the Component. Unless the Component is disabled, it will be active directly afterwards.
     */
    start() {
        log.info(`${this} starting...`);
        this._started = true;
        this.onStart();
        this.forEachChild((child) => {
            child.start();
        });
        log.info(`${this} started.`);
        if (this.hasEnabledPropertyInModel()) {
            log.info(`Watching '${this.enabledProperty}' property for enabled/disabled state.`);
            this.watchAlways(this.enabledProperty, this.updateEnabledState.bind(this), { immediate: mozel_1.immediate });
        }
        else {
            this.updateEnabledState();
        }
    }
    /**
     * Destroys the model, triggering the destruction of all related components, including this one.
     * Will clean up registered callbacks and other memory-sensitive data.
     */
    destroy() {
        this.model.$destroy();
    }
    onModelDestroyed() {
        this.stopListening();
        this.permanentWatchers.forEach(watcher => this.model.$removeWatcher(watcher));
        this.onDestroy();
        log.info(`${this} destroyed.`);
    }
    /**
     * Starts listening to all events, as defined with `listenTo` and `listenToEventName`.
     */
    startListening() {
        this.eventListeners.forEach(listener => listener.start());
    }
    /**
     * Stops listening to all events, as defined with `listenTo` and `listenToEventName`.
     */
    stopListening() {
        this.eventListeners.forEach(listener => listener.stop());
    }
    /**
     * Starts all model watchers, as defined with `watch`.
     */
    startWatchers() {
        this.watchers.forEach(watcher => this.model.$addWatcher(watcher));
    }
    /**
     * Stops all model watchers, as defined with `watch`
     */
    stopWatchers() {
        this.watchers.forEach(watcher => this.model.$removeWatcher(watcher));
    }
    /**
     * Enables/disables the Component. If the property representing the enable state exists on the model, it will be
     * set to the new state. Otherwise, the enabled state will be kept internally.
     *
     * For the Component to become active, all of its ancestors need to be enabled as well.
     *
     * @param {boolean} enabled		The new enabled state.
     */
    enable(enabled = true) {
        if (this.hasEnabledPropertyInModel()) {
            this.model.$set(this.enabledProperty, enabled);
        }
        else {
            this._enabled = enabled;
        }
        this.updateEnabledState();
    }
    /**
     * Updates the final enabled state of the Component, based on its own enabled state and that of its ancestors.
     * Will call `onEnabled` if the enabled state changes to `true`, and `onDisabled` if the enabled state changes to
     * `false`.
     * @protected
     */
    updateEnabledState() {
        if (!this.started)
            return;
        this.parentEnabled = !this.parent ? true : this.parent.enabled;
        if (this.enabled && this.lastReportedEnabledState !== true) {
            log.info(`${this} enabled.`);
            this.lastReportedEnabledState = true;
            this.onEnable();
            this.events.enabled.fire(new ComponentEnabledEvent(this));
            this.startWatchers();
        }
        else if (!this.enabled && this.lastReportedEnabledState !== false) {
            log.info(`${this} disabled.`);
            this.lastReportedEnabledState = false;
            this.onDisable();
            this.events.disabled.fire(new ComponentDisabledEvent(this));
            this.stopWatchers();
        }
        this.forEachChild(child => child.updateEnabledState());
    }
    /**
     * Concatenates the name of the Component with its GID between brackets, e.g.: "MyComponent (314)"
     */
    toString() {
        const name = `${this.name} (${this.gid})`;
        if (!this.parent) {
            return name;
        }
        return this.parent + '/' + name;
    }
    /**
     * Generates an object tree that can be conveniently logged for debugging.
     * @param {boolean} asReference		If set to `true`, will only log the component, gid and `_reference: true`.
     * 									This is to prevent infinite recursion.
     */
    toTree(asReference = false) {
        const tree = {
            _this: this,
            gid: this.gid
        };
        if (asReference) {
            tree._reference = true;
            return tree;
        }
        for (let path in this.allChildren) {
            const child = this.allChildren[path];
            if (child instanceof ComponentSlot_1.default) {
                const component = child.current;
                tree[path] = component ? component.toTree(child.isReference) : undefined;
            }
            else if (child instanceof ComponentList_1.default) {
                const list = [];
                child.each(component => list.push(component.toTree(child.isReference)));
                tree[path] = list;
            }
        }
        return tree;
    }
    /*
    Life cycle hooks
     */
    /**
     * Called when the scene loads. Allows Components to do some asynchronous tasks and notify when they're done.
     */
    async onLoad() { }
    /**
     * Called when the scene starts (after everything was loaded).
     */
    onStart() { }
    /**
     * Called when the Component is destroyed.
     */
    onDestroy() { }
    /**
     * Called when the Component is enabled.
     */
    onEnable() { }
    /**
     * Called when the Component is disabled.
     */
    onDisable() { }
    /**
     * Called when the parent of the component is set or changed.
     */
    onSetParent(parent) { }
};
Component.Model = mozel_1.default; // should be set for each extending class
Component.Events = ComponentEvents;
Component.Actions = ComponentActions;
Component._classComponentSlotDefinitions = [];
Component._classComponentListDefinitions = [];
Component = Component_1 = tslib_1.__decorate([
    inversify_1.injectable(),
    tslib_1.__param(0, inversify_1.inject(new inversify_1.LazyServiceIdentifer(() => mozel_1.default))),
    tslib_1.__param(1, inversify_1.inject(new inversify_1.LazyServiceIdentifer(() => ComponentFactory_1.default))),
    tslib_1.__param(2, inversify_1.inject(mozel_1.Registry)),
    tslib_1.__param(3, inversify_1.inject(EventBus_1.default)),
    tslib_1.__param(4, inversify_1.inject(inversify_1.Container))
], Component);
exports.default = Component;
//# sourceMappingURL=Component.js.map