import { Container } from "inversify";
import Component, { ComponentConstructor } from "../Component";
import Mozel, { Registry } from "mozel";
import EventBus from "../EventBus";
import EventInterface from "event-interface-mixin";
export default class ComponentFactory {
    /**
     * Infersify dependency container from which all registered dependencies can be retrieved. If provided in the constructor, this
     * will be the provided container. New dependencies should not be added to this container, at the risk of polluting
     * the external dependency container.
     */
    dependencies: Container;
    /** Local Infersify dependency Container to which any internal classes and services can be registered. */
    readonly localDependencies: Container;
    /** EventBus that is provided to all created Components to communicate between each other. */
    readonly eventBus: EventBus;
    /** Registry to which all created Components are registed. */
    readonly registry: Registry<Component>;
    /**
     * Creates a dependency container that can be used for the ComponentFactory.
     */
    static createDependencyContainer(): Container;
    constructor(eventBus?: EventInterface, componentRegistry?: Registry<Component>, dependencies?: Container);
    protected initDependencies(): void;
    /**
     * Creates a new dependency container, extending from the existing one.
     * Dependencies can be added to the new container without polluting the existing one.
     */
    extendDependencies(): Container;
    /**
     * Register a Component dependency.
     * @param ComponentClass	The Component class to instantiate.
     * @param ModelClass		The Model class for which to instantiate the Component. If omitted, will use the
     * 							ModelClass defined in the Component.
     */
    register(ComponentClass: (typeof Component) | (typeof Component)[], ModelClass?: typeof Mozel): void;
    /**
     * Registers a default Component class when a parent class is required.
     * @param {typeof Component} Base
     * @param {typeof Component} Implementation
     */
    registerDefault(Base: typeof Component, Implementation: typeof Component): void;
    /**
     * Finds the first bound component class up the hierarchy for the given Mozel class.
     * @param {typeof Mozel} Model
     */
    findFirstBoundModelInHierarchy(Model: typeof Mozel): typeof Mozel | undefined;
    /**
     * Creates a Component based on a Model.
     * If <T> matches ExpectedClass, is guaranteed to provide the correct class (or throw).
     *
     * @param {Mozel} model
     * @param {typeof Component} ExpectedClass
     */
    create<T extends Component>(model: Mozel, ExpectedClass?: ComponentConstructor<T>): T;
    /**
     * Attempts to find the component corresponding to the given model.
     * @param {Mozel} model
     * @param {typeof Component} ExpectedComponentClass		The expected Component class. Will throw if the found
     * 														(or created) Component is not of the correct class.
     * @param {boolean} createNonExisting					If set to `true`, will create a new instance if no existing
     * 														Component was found.
     */
    resolve<T extends Component>(model: Mozel, ExpectedComponentClass: ComponentConstructor<T>, createNonExisting: boolean): T | undefined;
}
