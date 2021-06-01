import EngineView from "@/Engine/views/EngineView";
import {component} from "@/Component";
import ComponentSlot from "@/Component/ComponentSlot";
import {schema} from "mozel";
import EngineModel from "@/Engine/models/EngineModel";
import UISceneView from "./UISceneView";
import {ReactViewComponent, ReactViewComponentProps} from "@/Engine/views/ui/ReactView";
import {AppBar, IconButton, Toolbar, Typography} from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu';
import ReactDOM from 'react-dom';
import {CSSProperties} from "react";

const STYLE_VIEW:CSSProperties = {
	position: "absolute",
	inset: 0,
	pointerEvents: "none"
}
const STYLE_APP_BAR:CSSProperties = {
	pointerEvents: "auto"
}

class UIEngineViewReact extends ReactViewComponent<ReactViewComponentProps<EngineModel>, {}> {
	render() {
		return (
			<div className="ui-engine-view" style={STYLE_VIEW}>
				<AppBar position="static" style={STYLE_APP_BAR}>
					<Toolbar>
						<IconButton edge="start" color="inherit" aria-label="menu">
							<MenuIcon />
						</IconButton>
						<Typography variant="h6">
							Engine
						</Typography>
					</Toolbar>
				</AppBar>
			</div>
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

		this.scene.init(scene => {
			if(!this.container || !scene) return;
			this.container.append(scene.domElement);
		});
		this.scene.deinit(scene => {
			if(!this.container || !scene) return;
			this.container.removeChild(scene.domElement);
		});
	}

	setSize(width: number, height: number) {
		super.setSize(width, height);
	}
	onAttachTo(container: HTMLElement) {
		super.onAttachTo(container);
		container.append(this.domElement);
		this.render();
	}
	render() {
		if(!this.container) return;
		const scene = this.scene.get();
		if(!scene) return;
		ReactDOM.render(<UIEngineViewReact model={this.model} childElements={[scene.domElement]}/>, this.domElement);
	}
	detach() {
		super.detach();
		this.domElement.remove();

		if(this.container) ReactDOM.unmountComponentAtNode(this.container);
	}
}
