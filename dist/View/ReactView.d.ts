import React from "react";
import View from "../View";
import { alphanumeric, MozelSchema, PropertySchema } from "mozel";
import PropertyWatcher, { PropertyChangeHandler, PropertyWatcherOptionsArgument } from "mozel/dist/PropertyWatcher";
import { PropertyValue } from "mozel/dist/Property";
import EventEmitter, { callback } from "../EventEmitter";
import ComponentList from "../Component/ComponentList";
import ComponentSlot from "../Component/ComponentSlot";
export declare type ReactViewComponentProps<T extends View> = {
    view: T;
};
/**
 * React Component that can be wrapped in a View, containing convenient getters and methods to communicate with the
 * View instance. By default, watches the model's direct properties to re-render when they change.
 */
export declare class ReactViewComponent<P extends ReactViewComponentProps<ReactView>, S> extends React.Component<P, S> {
    private watchers;
    private unmountCallbacks;
    /** Gets the connected View instance */
    get view(): P['view'];
    /** Gets the Model on which the rendering should be based */
    get model(): P['view']['model'];
    /**
     * Safely watch an event, unregistering the callback when component gets unmounted.
     * @param {EventEmitter} event
     * @param {Function} callback
     */
    watchEvent<T>(event: EventEmitter<T>, callback: callback<T>): void;
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
    watch<T extends PropertyValue>(path: string | PropertySchema<T> | MozelSchema<T>, handler: PropertyChangeHandler<T>, options?: PropertyWatcherOptionsArgument): PropertyWatcher;
    /**
     * Register a function to be called when the component unmounts.
     * @param {Function} callback
     */
    addUnmountCallback(callback: callback<any>): void;
    /**
     * Registers watchers
     * @protected
     */
    protected onInitWatchers(): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    /**
     * Renders all ReactViews in a ComponentList as JSX Elements.
     * @param {ComponentList} components
     */
    renderChildren(components: ComponentList<View>): JSX.Element[];
    /**
     * Renders a Component from a ComponentSlot as a JSX Element.
     * @param {ComponentSlot} component
     */
    renderChild(component: ComponentSlot<View>): JSX.Element | undefined;
}
export default class ReactView extends View {
    getReactComponent(): typeof React.Component;
    render(key?: alphanumeric): JSX.Element;
    onMount(container: HTMLElement): void;
    onDismount(): void;
}
