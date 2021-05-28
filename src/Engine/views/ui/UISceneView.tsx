import React, {CSSProperties} from "react";
import ReactView from "./ReactView";

const UI_SCENE_STYLE:CSSProperties = {
	position: 'absolute',
	left: 0,
	top: 0,
	right: 0,
	bottom: 0
}
type Props = {
	foo:string
}
type State = {
	foo:string
}
class UISceneViewReact extends React.Component<Props, State> {
	render() {
		return <div style={UI_SCENE_STYLE}>test</div>
	}
}

export default class UISceneView extends ReactView {
	ReactComponent = UISceneViewReact;
}
