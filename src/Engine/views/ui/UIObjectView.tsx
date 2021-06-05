import ObjectModel from "@/Engine/models/ObjectModel";
import React from "react";
import UIView, {ReactViewComponentPropsWithStyles, UIViewReact} from "@/Engine/views/ui/UIView";
import {components} from "@/Component";
import {schema} from "mozel";
import SceneModel from "@/Engine/models/SceneModel";
import ComponentList from "@/Component/ComponentList";
import View from "@/View";
import {createStyles, Theme, withStyles} from "@material-ui/core";
import {ReactViewComponent} from "@/Engine/views/ui/ReactView";
import ObjectController from "@/Engine/controllers/ObjectController";
import UIObjectProperties from "@/Engine/views/ui/UIObjectView/UIObjectProperties";

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
					onClick={this.handleClick.bind(this)}/>
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
	@components(schema(SceneModel).children, UIObjectView)
	children!:ComponentList<View>;

	controller?:ObjectController;

	getReactComponent(): typeof React.Component {
		return UIObjectViewReact as typeof React.Component;
	}

	onInit() {
		super.onInit();
		this.controller = this.findController(ObjectController);
	}
}
