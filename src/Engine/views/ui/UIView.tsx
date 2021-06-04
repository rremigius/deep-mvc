import "./UIView.css";
import ViewModel from "@/ViewModel";
import {
	Collapse,
	createStyles,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Theme,
	WithStyles,
	withStyles
} from "@material-ui/core";
import React from "react";
import ReactView, {ReactViewComponent, ReactViewComponentProps} from "@/Engine/views/ui/ReactView";
import View from "@/View";
import {Styles} from "@material-ui/core/styles/withStyles";
import {CropFree} from "@material-ui/icons";

export type ReactViewComponentPropsWithStyles<T extends View, S extends ()=>string|Styles<any,any,any>> =
	ReactViewComponentProps<T> & WithStyles<ReturnType<S>>;

type Props = ReactViewComponentPropsWithStyles<UIView, typeof styles> & {
	icon?: JSX.Element
};
type State = {expanded:boolean};

export const UIViewReact = withStyles(styles())(
	class UIViewReact extends ReactViewComponent<Props, State> {
		constructor(props:Props) {
			super(props);
			this.state = {expanded: true};
		}
		render() {
			const classes = this.props.classes;
			return (
				<div className={classes.uiView}>
					<ListItem button>
						<ListItemIcon>
							{this.props.icon ? this.props.icon : <CropFree/>}
						</ListItemIcon>
						<ListItemText>
							{this.model.static.type} ({this.model.gid})
						</ListItemText>
					</ListItem>
					<Collapse in={this.state.expanded} timeout="auto" unmountOnExit>
						<List component="div" disablePadding className={classes.children}>
							{this.renderChildren()}
						</List>
					</Collapse>
				</div>
			)
		}
	}
);

function styles() {
	return (theme: Theme) => createStyles({
		uiView: { /* ... */ },
		children: {
			paddingLeft: theme.spacing(2)
		},
		button: { /* ... */ },
	});
}

export default class UIView extends ReactView {
	static Model = ViewModel;
	model!:ViewModel;

	getReactComponent():typeof React.Component {
		return UIViewReact as typeof React.Component;
	}
}
