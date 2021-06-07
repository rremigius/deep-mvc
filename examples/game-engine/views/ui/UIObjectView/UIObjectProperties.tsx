import {ReactViewComponentPropsWithStyles} from "../UIView";
import {ReactViewComponent} from "@/View/ReactView";
import UIObjectView from "../UIObjectView";
import {createStyles, ListItem, TextField, Theme, withStyles} from "@material-ui/core";
import React from 'react';

function safeParseNumber(value:any) {
	const number = parseFloat(value);
	return !isNaN(number) ? number : 0;
}

type Props = ReactViewComponentPropsWithStyles<UIObjectView, typeof styles>;
type State = {};
const UIObjectProperties = withStyles(styles())(
	class UIObjectProperties extends ReactViewComponent<Props, State> {
		handleChangeX(event:React.ChangeEvent<HTMLInputElement>) {
			this.model.position.x = safeParseNumber(event.target.value);
		}
		handleChangeY(event:React.ChangeEvent<HTMLInputElement>) {
			this.model.position.y = safeParseNumber(event.target.value);
		}
		handleChangeZ(event:React.ChangeEvent<HTMLInputElement>) {
			this.model.position.z = safeParseNumber(event.target.value);
		}
		render() {
			const classes = this.props.classes;
			return <ListItem>
				<form className={classes.form} noValidate autoComplete="off">
					<TextField label="X" value={this.model.position.x} type="number" onChange={this.handleChangeX.bind(this)}/>
					<TextField label="Y" value={this.model.position.y} type="number" onChange={this.handleChangeY.bind(this)}/>
					<TextField label="Z" value={this.model.position.z} type="number" onChange={this.handleChangeZ.bind(this)}/>
				</form>
			</ListItem>;
		}
	}
)
function styles() {
	return (theme:Theme) => createStyles({
		form: {
			display: 'flex',
			flexDirection: 'row'
		}
	});
}

export default UIObjectProperties;
