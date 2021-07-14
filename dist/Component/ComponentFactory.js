"use strict";
var ComponentFactory_1;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const validation_kit_1 = require("validation-kit");
const mozel_1 = tslib_1.__importStar(require("mozel"));
const log_1 = tslib_1.__importDefault(require("../log"));
const EventBus_1 = tslib_1.__importDefault(require("../EventBus"));
const lodash_1 = require("lodash");
const log = log_1.default.instance("component-factory");
const ComponentSymbol = Symbol.for("Component");
let ComponentFactory = ComponentFactory_1 = class ComponentFactory {
    constructor(eventBus, componentRegistry, dependencies) {
        this.registry = componentRegistry || new mozel_1.Registry();
        this.eventBus = eventBus || new EventBus_1.default();
        this.localDependencies = ComponentFactory_1.createDependencyContainer();
        // Given container gets priority, then localContainer, then default
        if (dependencies) {
            this.dependencies = dependencies;
            this.dependencies.parent = this.localDependencies;
        }
        else {
            this.dependencies = this.localDependencies;
        }
        // Set scoped globals
        this.localDependencies.bind(ComponentFactory_1).toConstantValue(this);
        this.localDependencies.bind(mozel_1.Registry).toConstantValue(this.registry);
        this.localDependencies.bind(EventBus_1.default).toConstantValue(this.eventBus);
        this.initDependencies();
    }
    /**
     * Creates a dependency container that can be used for the ComponentFactory.
     */
    static createDependencyContainer() {
        return new inversify_1.Container({ autoBindInjectable: true });
    }
    // For override
    initDependencies() { }
    /**
     * Creates a new dependency container, extending from the existing one.
     * Dependencies can be added to the new container without polluting the existing one.
     */
    extendDependencies() {
        const newDependencies = new inversify_1.Container({ autoBindInjectable: true });
        newDependencies.parent = this.dependencies;
        return newDependencies;
    }
    /**
     * Register a Component dependency.
     * @param ComponentClass	The Component class to instantiate.
     * @param ModelClass		The Model class for which to instantiate the Component. If omitted, will use the
     * 							ModelClass defined in the Component.
     */
    register(ComponentClass, ModelClass) {
        if (lodash_1.isArray(ComponentClass)) {
            for (let Class of ComponentClass) {
                this.register(Class);
            }
            return;
        }
        ModelClass = ModelClass || ComponentClass.Model;
        if (!ModelClass)
            throw new Error(`No Model specified for ${ComponentClass.name}.`);
        this.localDependencies.bind(ComponentSymbol).to(ComponentClass).whenTargetNamed(ModelClass.type);
    }
    /**
     * Registers a default Component class when a parent class is required.
     * @param {typeof Component} Base
     * @param {typeof Component} Implementation
     */
    registerDefault(Base, Implementation) {
        this.localDependencies.bind(Base).to(Implementation);
    }
    /**
     * Finds the first bound component class up the hierarchy for the given Mozel class.
     * @param {typeof Mozel} Model
     */
    findFirstBoundModelInHierarchy(Model) {
        if (this.dependencies.isBoundNamed(ComponentSymbol, Model.type)) {
            return Model;
        }
        if (Model === mozel_1.default)
            return;
        return this.findFirstBoundModelInHierarchy(Model.getParentClass());
    }
    /**
     * Creates a Component based on a Model.
     * If <T> matches ExpectedClass, is guaranteed to provide the correct class (or throw).
     *
     * @param {Mozel} model
     * @param {typeof Component} ExpectedClass
     */
    create(model, ExpectedClass) {
        function isT(model) {
            return !ExpectedClass || model instanceof ExpectedClass;
        }
        // Other way of saying `model instanceof ExpectedClass.Model`, which TypeScript does not allow because Model is not a constructor type
        if (ExpectedClass && !validation_kit_1.isSubClass(model.constructor, ExpectedClass.Model)) {
            const message = `${ExpectedClass.name} expects ${ExpectedClass.Model.name}`;
            log.error(message, model);
            throw new Error(message);
        }
        // Component needs a Mozel in the constructor so we inject it through the container.
        let container = this.extendDependencies();
        container.bind(mozel_1.default).toConstantValue(model);
        container.bind(inversify_1.Container).toConstantValue(this.dependencies);
        let component;
        const BoundMozel = this.findFirstBoundModelInHierarchy(model.static);
        if (BoundMozel) {
            component = container.getNamed(ComponentSymbol, BoundMozel.type);
            log.info(`Component '${component.static.name}' generated for model '${model.static.type}'.`);
        }
        else if (ExpectedClass) {
            // Try an generic placeholder for the expected class
            component = container.get(ExpectedClass);
            log.info(`No Component registered for '${model.static.type}'; created generic ${ExpectedClass.name} (${component.static.name}).`);
        }
        else {
            throw new Error(`No Component registered for '${model.static.type}'; could not create generic Component.`);
        }
        // Store in Registry
        if (!isT(component)) {
            // TS: isT can only return false if ExpectedClass is defined
            const message = "Created Component was not a " + ExpectedClass.name;
            log.error(message, component, model);
            throw new Error(message);
        }
        this.registry.register(component);
        return component;
    }
    /**
     * Creates a Component based on a model, and resolves all references in the hierarchy right afterwards.
     * @param {Mozel} model
     * @param {typeof Component} ExpectedClass
     */
    createAndResolveReferences(model, ExpectedClass) {
        const component = this.create(model, ExpectedClass);
        component.resolveReferences();
        return component;
    }
    /**
     * Attempts to find the component corresponding to the given model.
     * @param {Mozel} model
     * @param {typeof Component} ExpectedComponentClass		The expected Component class. Will throw if the found
     * 														(or created) Component is not of the correct class.
     * @param {boolean} createNonExisting					If set to `true`, will create a new instance if no existing
     * 														Component was found.
     */
    resolve(model, ExpectedComponentClass, createNonExisting) {
        let component = this.registry.byGid(model.gid);
        // Create the component if it doesn't exist (unless suppressed).
        if (!component && createNonExisting) {
            component = this.create(model, ExpectedComponentClass);
        }
        if (!component) {
            throw new Error(`Could not resolve Component by GID ${model.gid}.`);
        }
        if (!(component instanceof ExpectedComponentClass)) {
            throw new Error(`Model GID ${model.gid} resolved to '${component.constructor.name}' rather than '${ExpectedComponentClass.name}'.`);
        }
        return component;
    }
};
ComponentFactory = ComponentFactory_1 = tslib_1.__decorate([
    inversify_1.injectable()
], ComponentFactory);
exports.default = ComponentFactory;
//# sourceMappingURL=ComponentFactory.js.map