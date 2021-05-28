import HtmlView from "./HtmlView";
import React from "react";
import ReactDOM from "react-dom";

export default class ReactView extends HtmlView {
	ReactComponent = React.Component;

	createDOMElement() {
		const div = super.createDOMElement();
		ReactDOM.render(<this.ReactComponent/>, div);
		return div;
	}
}
