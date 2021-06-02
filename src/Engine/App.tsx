import React from 'react';
import {AppBar, IconButton, makeStyles, Theme, Toolbar, Typography, withStyles} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import Engine from "@/Engine/Engine";

interface Props {
	engine: Engine,
	classes: {
		app:string,
		toolbarSpacer:string,
		engine:string
	}
}

class App extends React.Component<Props, {}> {
	engine:Engine;
	engineRef = React.createRef<HTMLDivElement>();

	constructor(props:Props) {
		super(props);
		this.engine = props.engine;
	}

	componentDidMount() {
		this.attachEngine();
	}

	componentDidUpdate() {
		this.attachEngine();
	}

	attachEngine() {
		if(!this.engineRef.current) return;
		this.engine.attach(this.engineRef.current);
	}

	render() {
		const { classes } = this.props;
		return (
			<div className={classes.app}>
				<AppBar>
					<Toolbar>
						<IconButton edge="start" color="inherit" aria-label="menu">
							<MenuIcon />
						</IconButton>
						<Typography variant="h6">
							Engine
						</Typography>
					</Toolbar>
				</AppBar>
				<div className={classes.toolbarSpacer}/>
				<div className={classes.engine} ref={this.engineRef}/>
			</div>
		)
	}
}
export default withStyles(theme => ({
	app: {
		display: 'flex',
		flexDirection: 'column',
		height: '100%'
	},
	toolbarSpacer: theme.mixins.toolbar,
	engine: {
		flex: 1,
		position: 'relative'
	}
}))(App);
