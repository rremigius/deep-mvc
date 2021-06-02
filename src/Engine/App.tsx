import React from 'react';
import {
	AppBar,
	createMuiTheme,
	Drawer,
	IconButton,
	Toolbar,
	Typography,
	ThemeProvider,
	withStyles, Box
} from "@material-ui/core";
import {ExpandMore, ChevronRight, Menu} from "@material-ui/icons";
import Engine from "@/Engine/Engine";
import {TreeItem, TreeView} from "@material-ui/lab";

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
		// Give some time for the UI to get its final size
		setTimeout(()=>this.attachEngine(),500);
	}

	componentDidUpdate() {
		// Give some time for the UI to get its final size
		setTimeout(()=>this.attachEngine(), 500);
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
		const theme = createMuiTheme({
			palette: {
				type: 'dark'
			},
		});

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
							<div className={classes.drawerContainer}>
								<TreeView
									defaultCollapseIcon={<ExpandMore />}
									defaultExpandIcon={<ChevronRight />}
								>
									<TreeItem nodeId="1" label="Applications">
										<TreeItem nodeId="2" label="Calendar" />
										<TreeItem nodeId="3" label="Chrome" />
										<TreeItem nodeId="4" label="Webstorm" />
									</TreeItem>
									<TreeItem nodeId="5" label="Documents">
										<TreeItem nodeId="10" label="OSS" />
										<TreeItem nodeId="6" label="Material-UI">
											<TreeItem nodeId="7" label="src">
												<TreeItem nodeId="8" label="index.js" />
												<TreeItem nodeId="9" label="tree-view.js" />
											</TreeItem>
										</TreeItem>
									</TreeItem>
								</TreeView>
							</div>
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
	drawerPaper: {
		width: drawerWidth
	},
	drawerContainer: {
		overflow: 'auto'
	}
}))(App) as typeof App // TS: withStyles changes the component signature so we cannot use it with ReactDOM.render
