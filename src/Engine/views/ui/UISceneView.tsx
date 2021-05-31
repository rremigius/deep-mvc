import React, {CSSProperties} from "react";
import ReactView, {ReactViewComponent} from "./ReactView";
import SceneModel from "@/Engine/models/SceneModel";
import {schema} from "mozel";
import UIObjectView from "@/Engine/views/ui/UIObjectView";
import ComponentList from "@/Component/ComponentList";
import {components} from "@/Component";
import View from "@/View";

const STYLE:CSSProperties = {
	pointerEvents: 'none',
	position: 'absolute',
	left: 0,
	top: 0,
	right: 0,
	bottom: 0
}
class UISceneViewReact extends ReactViewComponent<{model:SceneModel, childElements:HTMLElement[]},{foo:string}> {
	constructor(props:any) {
		super(props);
		this.state = {foo: 'bar'};
	}
	render() {
		return (
			<div className="ui-scene-view" style={STYLE}>
				<div>{this.props.model.gid} - {this.props.model.description}</div>
				{this.renderChildren()}
			</div>
		)
	}
}

export default class UISceneView extends ReactView {
	static Model = SceneModel;
	model!:SceneModel;

	// We use UIObjectView as factory type and runtime check, but cannot override parent type because of events
	@components(schema(SceneModel).children, UIObjectView)
	children!:ComponentList<View>;

	getReactComponent() {
		return UISceneViewReact;
	}
}
