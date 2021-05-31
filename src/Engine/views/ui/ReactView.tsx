import HtmlView from "./HtmlView";
import React from "react";
import ReactDOM from "react-dom";
import ViewModel from "@/ViewModel";

import {remove, throttle} from "lodash";
import Model from "mozel";

export type ReactViewComponentProps<T extends Model> = {
	model:T,
	childElements:HTMLElement[]
}

export class ReactViewComponent<M extends {model: ViewModel, childElements:HTMLElement[]}, S> extends React.Component<M, S> {
	children = React.createRef<HTMLDivElement>();

	componentDidMount() {
		this.appendChildren();
	}

	componentDidUpdate() {
		this.appendChildren();
	}

	appendChildren() {
		const children = this.children.current;
		if(children) {
			for(let element of this.props.childElements) {
				children.append(element);
			}
		}
	}

	renderChildren() {
		return <div ref={this.children}/>
	}
}

export default abstract class ReactView extends HtmlView {
	abstract getReactComponent():typeof ReactViewComponent

	container?:HTMLElement;
	childElements!:HTMLElement[]
	render!:()=>void;

	onInit() {
		this.childElements = [];
		this.render = throttle(this._render.bind(this), 1);

		super.onInit();

		// Shallow, first-level watching
		this.watch('*', () => {
			this.render();
		})
	}

	createDOMElement() {
		this.container = super.createDOMElement();
		this.render();
		return this.container;
	}

	_render() {
		if(!this.container) return;
		const ReactComponent = this.getReactComponent();
		ReactDOM.render(<ReactComponent model={this.model} childElements={this.childElements}/>, this.container);
		return this.container;
	}

	onDestroy() {
		super.onDestroy();
		if(this.container) ReactDOM.unmountComponentAtNode(this.container);
	}

	onViewAdd(view: HtmlView) {
		// We don't call super because we don't want the element to be child element to be added to the dom element directly
		this.childElements.push(view.domElement);
		this.render();
	}

	onViewRemove(view: HtmlView) {
		// We don't call super because we don't want the element to be child element to be removed from the dom element directly
		remove(this.childElements, element => element === view.domElement);
		this.render();
	}
}
