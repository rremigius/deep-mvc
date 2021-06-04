import "./UIView.css";
import ViewModel from "@/ViewModel";
import {Collapse, List, ListItem, ListItemText, Theme, withStyles} from "@material-ui/core";
import React from "react";
import ReactView, {ReactViewComponent, ReactViewComponentProps} from "@/Engine/views/ui/ReactView";

import { WithStyles, createStyles } from '@material-ui/core';

const styles = (theme: Theme) => createStyles({
	uiView: { /* ... */ },
	children: {
		paddingLeft: theme.spacing(4)
	},
	button: { /* ... */ },
});

type Props = ReactViewComponentProps<UIView> & WithStyles<typeof styles>;
type State = {expanded:boolean};
class UIViewReact extends ReactViewComponent<Props, State> {
	constructor(props:Props) {
		super(props);
		this.state = {expanded: true};
	}
	render() {
		const classes = this.props.classes;
		return (
			<div className={classes.uiView}>
				<ListItem>
					<ListItemText>
						{this.model.static.name} ({this.model.gid})
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

export default class UIView extends ReactView {
	static Model = ViewModel;
	model!:ViewModel;

	getReactComponent() {
		return withStyles(styles)(UIViewReact) as typeof UIViewReact;
	}
}
