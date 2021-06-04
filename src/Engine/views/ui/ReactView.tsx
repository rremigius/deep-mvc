import React from "react";
import View from "@/View";
import {alphanumeric} from "mozel";

export type ReactViewComponentProps<T extends View> = {
	view:T;
};

export class ReactViewComponent<P extends ReactViewComponentProps<ReactView>, S> extends React.Component<P, S> {
	get view():P['view'] {
		return this.props.view;
	}
	get model():P['view']['model'] {
		return this.props.view.model;
	}
	renderChildren() {
		return this.view.renderChildren();
	}
	componentDidMount() {
		this.props.view.model.$watch('*', () => {
			this.forceUpdate();
		});
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

	renderChildren() {
		return this.children
			.filter(view => view instanceof ReactView)
			.map((view, key) => (view as ReactView).render(key));
	}
}
