import ReactView, {ReactViewComponent, ReactViewComponentProps} from "./ReactView";
import ObjectModel from "@/Engine/models/ObjectModel";
import {Collapse, createStyles, List, ListItem, ListItemText, Theme, withStyles, WithStyles} from "@material-ui/core";
import React from "react";

const styles = (theme: Theme) => createStyles({
	uiView: { /* ... */ },
	children: {
		paddingLeft: theme.spacing(4)
	},
	button: { /* ... */ },
});

type Props = ReactViewComponentProps<UIObjectView> & WithStyles<typeof styles>;
type State = {expanded:boolean};
class UIObjectViewReact extends ReactViewComponent<Props,State> {
	constructor(props:Props) {
		super(props);
		this.state = {expanded:true};
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

export default class UIObjectView extends ReactView {
	static Model = ObjectModel;
	model!: ObjectModel;

	getReactComponent() {
		return withStyles(styles)(UIObjectViewReact) as typeof UIObjectViewReact;
	}
}
