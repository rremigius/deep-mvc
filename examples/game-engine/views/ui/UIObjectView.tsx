import ObjectModel from "@examples/game-engine/models/ObjectModel";
import React from "react";
import UIView, {ReactViewComponentPropsWithStyles, UIViewReact} from "@examples/game-engine/views/ui/UIView";
import {components} from "@/Component";
import {schema} from "mozel";
import SceneModel from "@examples/game-engine/models/SceneModel";
import ComponentList from "@/Component/ComponentList";
import View from "@/View";
import {createStyles, Theme, withStyles} from "@material-ui/core";
import ReactView, {ReactViewComponent} from "@examples/game-engine/views/ui/ReactView";
import ObjectController from "@examples/game-engine/controllers/ObjectController";
import UIObjectProperties from "@examples/game-engine/views/ui/UIObjectView/UIObjectProperties";

type Props = ReactViewComponentPropsWithStyles<UIObjectView, typeof styles>
type State = {};
export const UIObjectViewReact = withStyles(styles())(
	class UIObjectViewReact extends ReactViewComponent<Props, State> {
		handleClick() {
			if(this.view.controller) {
				this.view.controller.select();
			}
		}
		onInitWatchers() {
			super.onInitWatchers();
			this.view.watch('position.*', () => {
				this.forceUpdate();
			})
		}

		render() {
			return <div>
				<UIViewReact
					view={this.view}
					properties={<UIObjectProperties view={this.view}/>}
					selected={this.model.selected}
					onClick={this.handleClick.bind(this)}
					children={this.view.renderChildren()}
				/>
			</div>;
		}
	}
)
function styles() {
	return (theme:Theme) => createStyles({

	});
}

export default class UIObjectView extends UIView {
	static Model = ObjectModel;
	model!: ObjectModel;

	// We use UIObjectView as factory type and runtime check, but cannot override parent type because of events
	@components(schema(SceneModel).objects, UIObjectView)
	objects!:ComponentList<View>;

	controller?:ObjectController;

	getReactComponent(): typeof React.Component {
		return UIObjectViewReact as typeof React.Component;
	}

	onInit() {
		super.onInit();
		this.controller = this.findController(ObjectController);
	}

	renderChildren() {
		return this.objects
			.filter(view => view instanceof ReactView)
			.map((view, key) => (view as ReactView).render(key));
	}
}
