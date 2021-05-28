import HtmlView from "./HtmlView";
import React from "react";
import ReactDOM from "react-dom";
import ViewModel from "@/ViewModel";
import {schema, deep} from "mozel";

export class ReactViewComponent<M extends {model: ViewModel}, S> extends React.Component<M, S> {

}

export default abstract class ReactView extends HtmlView {
	abstract getReactComponent():typeof ReactViewComponent

	container?:HTMLElement;

	onInit() {
		super.onInit();
		this.watch(schema(ViewModel), model => {
			this.render();
		}, {deep})
	}

	createDOMElement() {
		this.container = super.createDOMElement();
		this.render();
		return this.container;
	}

	render() {
		if(!this.container) return;
		const ReactComponent = this.getReactComponent();
		ReactDOM.render(<ReactComponent model={this.model}/>, this.container);
		return this.container;
	}

	onDestroy() {
		super.onDestroy();
		if(this.container) ReactDOM.unmountComponentAtNode(this.container);
	}
}
