import React, {CSSProperties} from "react";
import ReactView, {ReactViewComponent} from "./ReactView";
import SceneModel from "@/Engine/models/SceneModel";

const UI_SCENE_STYLE:CSSProperties = {
	position: 'absolute',
	left: 0,
	top: 0,
	right: 0,
	bottom: 0
}
class UISceneViewReact extends ReactViewComponent<{model:SceneModel},{foo:string}> {
	constructor(props:any) { //TODO: type
		super(props);
		this.state = {foo: 'bar'};
	}
	render() {
		return <div style={UI_SCENE_STYLE}>{this.props.model.gid} - {this.props.model.description}</div>
	}
}

export default class UISceneView extends ReactView {
	static Model = SceneModel;
	model!:SceneModel;

	getReactComponent() {
		return UISceneViewReact;
	}
}
