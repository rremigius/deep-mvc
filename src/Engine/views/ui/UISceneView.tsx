import React from "react";
import SceneModel from "@/Engine/models/SceneModel";
import {schema} from "mozel";
import {components} from "@/Component";
import UIObjectView from "@/Engine/views/ui/UIObjectView";
import ComponentList from "@/Component/ComponentList";
import View from "@/View";
import UIView, {ReactViewComponentPropsWithStyles, UIViewReact} from "@/Engine/views/ui/UIView";
import {createStyles, Theme, withStyles} from "@material-ui/core";
import {ReactViewComponent} from "@/Engine/views/ui/ReactView";
import {Category} from "@material-ui/icons";

type Props = ReactViewComponentPropsWithStyles<UISceneView, typeof styles>
type State = {};
export const UISceneViewReact = withStyles(styles())(
	class UISceneViewReact extends ReactViewComponent<Props, State> {
		render() {
			return <UIViewReact view={this.view} icon={<Category/>}/>;
		}
	}
);
function styles() {
	return (theme:Theme) => createStyles({

	});
}

export default class UISceneView extends UIView {
	static Model = SceneModel;
	model!:SceneModel;

	// We use UIObjectView as factory type and runtime check, but cannot override parent type because of events
	@components(schema(SceneModel).children, UIObjectView)
	children!:ComponentList<View>;

	getReactComponent(): typeof React.Component {
		return UISceneViewReact as typeof React.Component;
	}
}
