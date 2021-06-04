import React from "react";
import ReactView, {ReactViewComponent, ReactViewComponentProps} from "./ReactView";
import SceneModel from "@/Engine/models/SceneModel";
import {Collapse, List, ListItem, ListItemText} from "@material-ui/core";
import {schema} from "mozel";
import {components} from "@/Component";
import UIObjectView from "@/Engine/views/ui/UIObjectView";
import ComponentList from "@/Component/ComponentList";
import View from "@/View";

export class UISceneViewReact extends ReactViewComponent<ReactViewComponentProps<UISceneView>,{expanded:boolean}> {
	constructor(props:ReactViewComponentProps<UISceneView>) {
		super(props);
		this.state = {expanded: true};
	}
	render() {
		return (
			<div>
				<ListItem>
					<ListItemText>
						{this.model.static.name} ({this.model.gid})
					</ListItemText>
				</ListItem>
				<Collapse in={this.state.expanded} timeout="auto" unmountOnExit>
					<List component="div" disablePadding>
						{this.renderChildren()}
					</List>
				</Collapse>
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
