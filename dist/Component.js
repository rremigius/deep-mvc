var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var Component_1;
import { Container, inject, injectable, LazyServiceIdentifer } from "inversify";
import ComponentFactory from "@/Component/ComponentFactory";
import Log from "@/log";
import Loader from "deep-loader";
import EventListener from "@/EventListener";
import ComponentList from "@/Component/ComponentList";
import ComponentSlot from "@/Component/ComponentSlot";
import Mozel, { immediate, Registry } from "mozel";
import EventBus from "@/EventBus";
import { Events } from "@/EventEmitter";
import { isString } from 'lodash';
import Property from "mozel/dist/Property";
import { isSubClass } from "validation-kit";
import { LogLevel } from "log-control";
import PropertyWatcher from "mozel/dist/PropertyWatcher";
import { DestroyedEvent } from "mozel/dist/Mozel";
const log = Log.instance("component");
/**
 * Base class for Component Actions.
 */
export class ComponentAction {
    /**
     * Payload of the event.
     * @param {T} data
     */
    constructor(data) {
        this.data = data;
    }
}
/**
 * Base class for Component Events
 */
export class ComponentEvent {
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
/**
 * Fires when the Component gets enabled.
 */
export class ComponentEnabledEvent extends ComponentEvent {
}
/**
 * Fires when the Component gets disabled.
 */
export class ComponentDisabledEvent extends ComponentEvent {
}
export class ComponentEvents extends Events {
    constructor() {
        super(true);
        this.enabled = this.$event(ComponentEnabledEvent);
        this.disabled = this.$event(ComponentDisabledEvent);
    }
}
/**
 * Action to enable/disable the Component.
 */
export class ComponentEnableAction extends ComponentAction {
}
export class ComponentActions extends Events {
    constructor() {
        super(...arguments);
        this.enable = this.$action(ComponentEnableAction);
    }
    $action(ActionClass) {
        return this.$event(ActionClass);
    }
}
// DECORATORS
/**
 * Defines a ComponentSlot for the current Component class, to instantiate or find the child component corresponding
 * to the model at the given path.
 * @param modelPath					Path of the model based on which the child component should be resolved.
 * 									Can be a string, or a Schema provided by `schema(Model)`.
 * @param ExpectedComponentClass	Component class that is expected to be instantiated (runtime verification).
 */
export function component(modelPath, ExpectedComponentClass) {
    return function (target, propertyName) {
        if (!isString(modelPath))
            modelPath = modelPath.$path;
        target.static.defineComponentSlot(propertyName, modelPath, ExpectedComponentClass);
    };
}
/**
 * Defines a ComponentList for the current Component class, to instantiate or find the child components corresponding
 * to the model at the given path.
 * @param modelPath					Path of the model based on which the child components should be resolved.
 * 									Can be a string, or a Schema provided by `schema(Model)`.
 * @param ExpectedComponentClass	Component class that is expected to be instantiated (runtime verification).
 */
export function components(modelPath, ExpectedComponentClass) {
    return function (target, propertyName) {
        if (!isString(modelPath))
            modelPath = modelPath.$path;
        target.static.defineComponentList(propertyName, modelPath, ExpectedComponentClass);
    };
}
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
        const name = this.toString();
        this.loader = new Loader(name);
        this.loader.log.setLevel(LogLevel.WARN);
        this.model.$on(DestroyedEvent, () => this.onModelDestroyed());
        this.setupActionsAndEvents();
        this.initClassDefinitions();
        this.onInit();
        this.initialized = true;
    }
    /**
     * Creates a ComponentFactory, with the current Component class already registered.
     */
    static createFactory() {
        const factory = new ComponentFactory();
        if (this !== Component_1)
            factory.register(this);
        return factory;
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
        if (!isSubClass(ActionClass, ComponentAction)) {
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
        const finalPath = isString(path) ? path : path.$path;
        const allOptions = {
            ...options,
            ...{
                path: finalPath,
                handler: handler,
                immediate: true
            }
        };
        return new PropertyWatcher(this.model, allOptions);
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
        if (modelPath instanceof Property) {
            modelPath = modelPath.getPathFrom(this.model);
        }
        const sync = new ComponentSlot(this, this.model, modelPath, ComponentClass.Model, ComponentClass, this.factory);
        sync.startWatching();
        this.allChildren[modelPath] = sync;
        return sync;
    }
    setupSubComponents(modelPath, ComponentClass) {
        if (modelPath instanceof Property) {
            modelPath = modelPath.getPathFrom(this.model);
        }
        const list = new ComponentList(this, this.model, modelPath, ComponentClass.Model, ComponentClass, this.factory);
        list.startWatching();
        this.allChildren[modelPath] = list;
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
        const eventListener = new EventListener(event, callback);
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
            if (child instanceof ComponentSlot) {
                const component = child.current;
                if (!component)
                    continue;
                callback(component);
            }
            else if (child instanceof ComponentList) {
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
            sync.resolveReferences = true;
            sync.sync();
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
            this.watchAlways(this.enabledProperty, this.updateEnabledState.bind(this), { immediate });
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
            if (child instanceof ComponentSlot) {
                const component = child.current;
                tree[path] = component ? component.toTree(child.isReference) : undefined;
            }
            else if (child instanceof ComponentList) {
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
Component.Model = Mozel; // should be set for each extending class
Component.Events = ComponentEvents;
Component.Actions = ComponentActions;
Component._classComponentSlotDefinitions = [];
Component._classComponentListDefinitions = [];
Component = Component_1 = __decorate([
    injectable(),
    __param(0, inject(new LazyServiceIdentifer(() => Mozel))),
    __param(1, inject(new LazyServiceIdentifer(() => ComponentFactory))),
    __param(2, inject(Registry)),
    __param(3, inject(EventBus)),
    __param(4, inject(Container))
], Component);
export default Component;
//# sourceMappingURL=Component.js.map