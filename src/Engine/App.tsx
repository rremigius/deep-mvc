import React from 'react';
import {AppBar, Drawer, IconButton, Toolbar, Typography, withStyles} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import Engine from "@/Engine/Engine";

interface Props {
	engine: Engine
}
interface State {
	drawer:boolean;
}
interface Classes {
	app:string,
	appBar:string,
	engine:string,
	drawer:string,
	drawerHeader:string,
	drawerPaper:string,
	drawerContainer:string
}

export type PropsWithStyles<P,S> = P & {classes: S};
export type PropsWithOptionalStyles<P,S> = P & {classes?: S};

class App extends React.Component<PropsWithOptionalStyles<Props, Classes>, State> {
	engine:Engine;
	engineRef = React.createRef<HTMLDivElement>();

	constructor(props:PropsWithOptionalStyles<Props,Classes>) {
		super(props);
		this.state = {drawer: true};

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

	toggleDrawer() {
		this.setState({drawer: !this.state.drawer})
	}

	render() {
		// TS: withStyles injects the classes
		const {classes} = this.props as PropsWithStyles<Props, Classes>;
		return (
			<div className={classes.app}>
				<AppBar className={classes.appBar}>
					<Toolbar>
						<IconButton edge="start" color="inherit" aria-label="menu" onClick={this.toggleDrawer.bind(this)}>
							<MenuIcon />
						</IconButton>
						<Typography variant="h6">
							Engine
						</Typography>
					</Toolbar>
				</AppBar>
				<Drawer className={classes.drawer}
						classes={{paper: classes.drawerPaper}}
						variant="persistent"
						anchor="left"
						open={this.state.drawer}>
					<Toolbar />
					<div className={classes.drawerContainer}>
						test
					</div>
				</Drawer>
				<Toolbar />
				<div className={classes.engine + (this.state.drawer ? " drawer" : "")} ref={this.engineRef}/>
			</div>
		)
	}
}
const drawerWidth = 240;
export default withStyles(theme => ({
	app: {
		display: 'flex',
		flexDirection: 'column',
		height: '100%'
	},
	appBar: {
		zIndex: theme.zIndex.drawer + 1,
	},
	engine: {
		flex: 1,
		position: 'relative',
		"&.drawer": {
			marginLeft: drawerWidth
		}
	},
	drawer: {
		width: drawerWidth
	},
	drawerHeader: {
		display: 'flex',
		alignItems: 'center',
		padding: theme.spacing(0, 1),
		// necessary for content to be below app bar
		...theme.mixins.toolbar,
		justifyContent: 'flex-end',
	},
	drawerPaper: {
		width: drawerWidth
	},
	drawerContainer: {
		overflow: 'auto'
	}
}))(App) as typeof App // TS: withStyles changes the component signature so we cannot use it with ReactDOM.render
