import EngineModel from "@examples/game-engine/models/EngineModel";
import {ReactViewComponent, ReactViewComponentProps} from "@/View/ReactView";
import UISceneView from "@examples/game-engine/views/ui/UISceneView";
import {schema} from "mozel";
import {component} from "@/Component";
import ComponentSlot from "@/Component/ComponentSlot";
import React from 'react';
import UIView, {UIViewReact} from "./UIView";
import {Memory} from "@material-ui/icons";

class UIEngineReactViewComponent extends ReactViewComponent<ReactViewComponentProps<UIEngineView>, {}> {
	render() {
		const scene = this.view.scene.current;
		return <UIViewReact
			view={this.view}
			icon={<Memory/>}
			children={scene ? [scene.render()] : undefined}
		/>
	}
}

export default class UIEngineView extends UIView {
	static Model = EngineModel;
	model!:EngineModel;

	@component(schema(UIEngineView.Model).scene, UISceneView)
	scene!:ComponentSlot<UISceneView>;

	getReactComponent(): typeof React.Component {
		return UIEngineReactViewComponent as typeof React.Component;
	}
}
