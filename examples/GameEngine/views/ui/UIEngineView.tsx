import EngineModel from "@examples/GameEngine/models/EngineModel";
import {ReactViewComponentProps} from "@examples/GameEngine/views/ui/ReactView";
import {List} from "@material-ui/core";
import EngineView from "@examples/GameEngine/views/EngineView";
import UISceneView from "@examples/GameEngine/views/ui/UISceneView";
import ReactDOM from "react-dom";
import {schema} from "mozel";
import {component} from "@/Component";
import ComponentSlot from "@/Component/ComponentSlot";
import React from 'react';

class UIEngineReactViewComponent extends React.Component<ReactViewComponentProps<UIEngineView>, {}> {
	render() {
		const scene = this.props.view.scene.current;
		return (
			<List>
				{ scene ? scene.render(): undefined }
			</List>
		)
	}
}

export default class UIEngineView extends EngineView {
	static Model = EngineModel;
	model!:EngineModel;

	@component(schema(EngineModel).scene, UISceneView)
	scene!:ComponentSlot<UISceneView>;

	domElement!:HTMLElement;

	onInit() {
		this.domElement = document.createElement('div');
		this.domElement.className = 'ui-engine-view-container';

		super.onInit();
	}

	setSize(width: number, height: number) {
		super.setSize(width, height);
	}
	onAttachTo(container: HTMLElement) {
		super.onAttachTo(container);
		ReactDOM.render(this.render(), container);
	}
	detach() {
		super.detach();
		if(!this.container) return;
		ReactDOM.unmountComponentAtNode(this.container);
	}
	render() {
		return <UIEngineReactViewComponent view={this}/>;
	}
}
