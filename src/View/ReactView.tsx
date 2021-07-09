import React from "react";
import View from "../View";
import {alphanumeric, MozelSchema, PropertySchema} from "mozel";
import ReactDOM from "react-dom";
import PropertyWatcher, {PropertyChangeHandler, PropertyWatcherOptionsArgument} from "mozel/dist/PropertyWatcher";
import {PropertyValue} from "mozel/dist/Property";
import EventEmitter, {callback} from "../EventEmitter";
import ComponentList from "../Component/ComponentList";
import ComponentSlot from "../Component/ComponentSlot";

export type ReactViewComponentProps<T extends View> = {
	view:T;
};

// TODO: implement componentDidUpdate to check for changes to view prop?

/**
 * React Component that can be wrapped in a View, containing convenient getters and methods to communicate with the
 * View instance. By default, watches the model's direct properties to re-render when they change.
 */
export class ReactViewComponent<P extends ReactViewComponentProps<ReactView>, S> extends React.Component<P, S> {
	private watchers:PropertyWatcher[] = [];
	private unmountCallbacks:callback<void>[] = [];

	/** Gets the connected View instance */
	get view():P['view'] {
		return this.props.view;
	}
	/** Gets the Model on which the rendering should be based */
	get model():P['view']['model'] {
		return this.props.view.model;
	}

	/**
	 * Safely watch an event, unregistering the callback when component gets unmounted.
	 * @param {EventEmitter} event
	 * @param {Function} callback
	 */
	watchEvent<T>(event:EventEmitter<T>, callback:callback<T>) {
		const listener = event.on(callback);
		this.addUnmountCallback(()=>event.off(listener));
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
	watch<T extends PropertyValue>(path:string|PropertySchema<T>|MozelSchema<T>, handler:PropertyChangeHandler<T>, options?:PropertyWatcherOptionsArgument) {
		const watcher = this.view.createWatcher(path, handler, options);
		this.watchers.push(watcher);
		return watcher;
	}

	/**
	 * Register a function to be called when the component unmounts.
	 * @param {Function} callback
	 */
	addUnmountCallback(callback:callback<any>) {
		this.unmountCallbacks.push(callback);
	}

	/**
	 * Registers watchers
	 * @protected
	 */
	protected onInitWatchers() {
		this.watch('*', () => {
			this.forceUpdate();
		});
	}
	componentDidMount() {
		this.onInitWatchers();
		for(let watcher of this.watchers) {
			this.model.$addWatcher(watcher);
		}
	}
	componentWillUnmount() {
		for(let watcher of this.watchers) {
			this.model.$removeWatcher(watcher);
		}
		for(let callback of this.unmountCallbacks) {
			callback();
		}
	}

	/**
	 * Renders all ReactViews in a ComponentList as JSX Elements.
	 * @param {ComponentList} components
	 */
	renderChildren(components:ComponentList<View>) {
		return components
			.filter(view => view instanceof ReactView)
			.map((view, key) => (view as ReactView).render({key}));
	}

	/**
	 * Renders a Component from a ComponentSlot as a JSX Element.
	 * @param {ComponentSlot} component
	 */
	renderChild(component:ComponentSlot<View>) {
		if(!(component.current instanceof ReactView)) return;
		return component.current.render();
	}
}

export default class ReactView extends View {
	getReactComponent():typeof React.Component{
		throw new Error(`${this.static.name} does not have getReactComponent implemented.`);
	}

	render(props:Record<string, any> = {}) {
		const Component = this.getReactComponent();
		props = {
			...props,
			view: this
		}
		return <Component {...props}/>
	}

	onMount(container: HTMLElement) {
		super.onMount(container);
		ReactDOM.render(this.render(), container);
	}
	onDismount() {
		super.onDismount();
		if(!this.container) return;
		ReactDOM.unmountComponentAtNode(this.container);
	}
}
