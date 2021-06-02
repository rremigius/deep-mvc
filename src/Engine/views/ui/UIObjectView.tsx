import ReactView, {ReactViewComponent, ReactViewComponentProps} from "./ReactView";
import ObjectModel from "@/Engine/models/ObjectModel";

class UIObjectViewReact extends ReactViewComponent<ReactViewComponentProps<ObjectModel>, object> {
	render() {
		return (
			<div className="component-view ui-object-view">
				<div className="details">
					<table>
						<tbody>
							<tr><td>Type:</td><td>{this.props.model.static.type}</td></tr>
							<tr><td>GID:</td><td>{this.props.model.gid}</td></tr>
							<tr><td>Position:</td><td>{this.props.model.position.x},{this.props.model.position.y},{this.props.model.position.z}</td></tr>
						</tbody>
					</table>
				</div>
				{this.renderDefaultChildrenElement()}
			</div>
		)
	}
}

export default class UIObjectView extends ReactView {
	static Model = ObjectModel;
	model!: ObjectModel;

	getReactComponent() {
		return UIObjectViewReact;
	}
}
