import ReactView, {ReactViewComponent, ReactViewComponentProps} from "./ReactView";
import ViewModel from "@/ViewModel";

class UIViewReact extends ReactViewComponent<ReactViewComponentProps<ViewModel>, object> {
	render() {
		return (
			<div className="ui-view">
				<div className="details">
					<table>
						<tbody>
							<tr><td>Type:</td><td>{this.props.model.static.type}</td></tr>
							<tr><td>GID:</td><td>{this.props.model.gid}</td></tr>
						</tbody>
					</table>
				</div>
				{this.renderChildren()}
			</div>
		)
	}
}

export default class UIView extends ReactView {
	static Model = ViewModel;
	model!:ViewModel;

	getReactComponent() {
		return UIViewReact;
	}
}
