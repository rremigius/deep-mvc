import React from "react";
import SceneModel from "@examples/game-engine/models/SceneModel";
import {schema} from "mozel";
import {components} from "@/Component";
import UIObjectView from "@examples/game-engine/views/ui/UIObjectView";
import ComponentList from "@/Component/ComponentList";
import View from "@/View";
import UIView, {ReactViewComponentPropsWithStyles, UIViewReact} from "@examples/game-engine/views/ui/UIView";
import {createStyles, Theme, withStyles} from "@material-ui/core";
import ReactView, {ReactViewComponent} from "@/View/ReactView";
import {Category} from "@material-ui/icons";

type Props = ReactViewComponentPropsWithStyles<UISceneView, typeof styles>
type State = {};
export const UISceneViewReact = withStyles(styles())(
	class UISceneViewReact extends ReactViewComponent<Props, State> {
		onInitWatchers() {
			super.onInitWatchers();
			this.watchEvent(this.view.objects.events.add, ()=>this.forceUpdate());
			this.watchEvent(this.view.objects.events.remove, ()=>this.forceUpdate());
		}

		render() {
			return <UIViewReact
				view={this.view}
				icon={<Category/>}
				children={this.view.renderChildren()}
			/>;
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
	@components(schema(SceneModel).objects, UIObjectView)
	objects!:ComponentList<View>;

	getReactComponent(): typeof React.Component {
		return UISceneViewReact as typeof React.Component;
	}

	renderChildren() {
		return this.objects
			.filter(view => view instanceof ReactView)
			.map((view, key) => (view as ReactView).render(key));
	}
}
