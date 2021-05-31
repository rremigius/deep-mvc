import React, {CSSProperties} from "react";
import ReactView, {ReactViewComponent} from "./ReactView";
import SceneModel from "@/Engine/models/SceneModel";

const STYLE:CSSProperties = {
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

	getReactComponent() {
		return UISceneViewReact;
	}
}
