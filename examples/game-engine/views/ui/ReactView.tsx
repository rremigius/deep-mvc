import React from "react";
import View from "@/View";
import {alphanumeric, MozelSchema, PropertySchema} from "mozel";
import ReactDOM from "react-dom";
import PropertyWatcher, {PropertyChangeHandler, PropertyWatcherOptionsArgument} from "mozel/dist/PropertyWatcher";
import {PropertyValue} from "mozel/dist/Property";

export type ReactViewComponentProps<T extends View> = {
	view:T;
};

export class ReactViewComponent<P extends ReactViewComponentProps<ReactView>, S> extends React.Component<P, S> {
	watchers:PropertyWatcher[] = [];

	get view():P['view'] {
		return this.props.view;
	}
	get model():P['view']['model'] {
		return this.props.view.model;
	}
	watch<T extends PropertyValue>(path:string|PropertySchema<T>|MozelSchema<T>, handler:PropertyChangeHandler<T>, options?:PropertyWatcherOptionsArgument) {
		const watcher = this.view.createWatcher(path, handler, options);
		this.watchers.push(watcher);
		return watcher;
	}
	onInitWatchers() {
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
	}
}

export default class ReactView extends View {
	getReactComponent():typeof React.Component{
		throw new Error(`${this.static.name} does not have getReactComponent implemented.`);
	}

	render(key?:alphanumeric) {
		const Component = this.getReactComponent();
		return <Component view={this} key={key}/>
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
