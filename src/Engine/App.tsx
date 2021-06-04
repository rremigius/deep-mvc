import React from 'react';
import {
	AppBar,
	Box,
	createMuiTheme, createStyles,
	Drawer,
	IconButton, List, Theme,
	ThemeProvider,
	Toolbar,
	Typography, WithStyles,
	withStyles
} from "@material-ui/core";
import {Menu} from "@material-ui/icons";
import Engine from "@/Engine/Engine";
import Component from "@/Component";
import UIEngineView from "@/Engine/views/ui/UIEngineView";

type Props = WithStyles<typeof styles> & {
	engine: Engine
}
type State = {
	drawer:boolean;
}
class App extends React.Component<Props, State> {
	engine:Engine;
	engineRef = React.createRef<HTMLDivElement>();

	constructor(props:Props) {
		super(props);
		this.state = {drawer: true};

		this.engine = props.engine;
	}

	componentDidMount() {
		// Give some time for the UI to get its final size
		setTimeout(()=>this.attachEngine(),500);
	}

	componentDidUpdate() {
		// Give some time for the UI to get its final size
		setTimeout(()=>this.attachEngine(), 500);
	}

	attachEngine() {
		const containers:Record<string, HTMLElement> = {};
		if(this.engineRef.current) {
			containers.view = this.engineRef.current;
		}
		// We attach UI by React

		this.engine.attach(containers);
	}

	toggleDrawer() {
		this.setState({drawer: !this.state.drawer})
	}

	render() {
		const {classes} = this.props;
		const theme = createMuiTheme({
			palette: {
				type: 'dark'
			},
		});

		let ui:Component|null = this.engine.getRootComponent('ui');
		if(!(ui instanceof UIEngineView)) {
			ui = null;
		}

		return (
			<ThemeProvider theme={theme}>
				<div className={classes.app}>
					<AppBar className={classes.appBar}>
						<Toolbar>
							<IconButton edge="start" color="inherit" aria-label="menu" onClick={this.toggleDrawer.bind(this)}>
								<Menu />
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
						<Box p={1}>
							<Toolbar/>

							{ui ? ui.render() : undefined}

						</Box>
					</Drawer>
					<Toolbar />

					<div className={classes.engine + (this.state.drawer ? " drawer" : "")} ref={this.engineRef}/>
				</div>
			</ThemeProvider>
		)
	}
}
const drawerWidth = 240;
const styles = (theme: Theme) => createStyles({
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
	drawerPaper: {
		width: drawerWidth
	},
	drawerContainer: {
		overflow: 'auto'
	}
});
export default withStyles(styles)(App) as typeof App // TS: withStyles changes the component signature so we cannot use it with ReactDOM.render
