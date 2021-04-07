import EngineModel from "@/Engine/models/EngineModel";
import {Container} from "inversify";
import ControllerFactory from "@/Controller/ControllerFactory";
import ViewFactory from "@/Engine/views/ViewFactory";
import IRenderer from "@/Engine/views/common/IRenderer";
import defaultControllerDependencies from "@/Engine/controllers/dependencies";
import defaultViewDependencies from "@/Engine/views/headless/dependencies";

import Log from "@/log";
import EngineController, {FrameEvent} from "@/Engine/controllers/EngineController";

const log = Log.instance("engine");

export default abstract class EngineAbstract {
	private container?:HTMLElement;
	private _onResize!:()=>void;

	protected running = false;
	protected readonly renderer:IRenderer;
	protected readonly controller:EngineController;

	static getDefaultControllerDependencies() {
		return defaultControllerDependencies;
	}

	static getDefaultViewDependencies() {
		return defaultViewDependencies;
	}

	constructor(model:EngineModel, viewDependencies?:Container, controllerDependencies?:Container) {
		controllerDependencies = controllerDependencies || this.static.getDefaultControllerDependencies();
		viewDependencies = viewDependencies || this.static.getDefaultViewDependencies();

		const viewFactory = new ViewFactory(viewDependencies);
		const controllerFactory = new ControllerFactory(controllerDependencies, viewFactory);
		this.controller = controllerFactory.createAndResolveReferences(model, EngineController);
		this.renderer = this.createRenderer();

		if(typeof window !== 'undefined') {
			this._onResize = this.onResize.bind(this);
			window.addEventListener('resize', this._onResize);
		}

		this.init();
		this.load().catch(error => {
			log.error("Engine failed to load:", error);
		});
	}

	abstract init():void;

	abstract createRenderer():IRenderer;

	get camera() {
		const cameraController = this.controller.camera.get();
		if(!cameraController) return undefined;
		return cameraController.view;
	}

	get events() {
		return this.controller.events;
	}

	get static() {
		return <typeof EngineAbstract>this.constructor;
	}

	attach(container:HTMLElement) {
		this.container = container;
		this.renderer.attachTo(container);
		this.onResize();
	}

	detach() {
		if(!this.container) return;
		this.renderer.detach();
		this.container = undefined;
	}

	render() {
		const camera = this.controller.camera.get();
		const scene = this.controller.scene.get();
		if(!camera || !scene) return;

		this.renderer.render(scene.view, camera.view);
	}

	private animate() {
		// run the rendering loop
		this.frame();
		this.render();

		// keep looping
		if(this.running) {
			requestAnimationFrame( this.animate.bind(this) );
		}
	}

	/**
	 * Updates the state of the Scene. Called every animation frame. Override for control over the update loop.
	 * Calls all frame listeners to do their thing
	 */
	frame() {
		this.controller.events.frame.fire(new FrameEvent(Date.now()));
	}

	onResize() {
		if(this.container) {
			let height = this.container.clientHeight;
			let width = this.container.clientWidth;

			this.renderer.setSize(width, height);

			const camera = this.controller.camera.get();
			if(camera) {
				camera.setAspectRatio(width / height);
			}
		}
	}

	// For override. Anything asynchronous can be initialized here.
	async load() {

	}

	start() {
		this.running = true;
		this.controller.start();
	}

	stop() {
		this.running = false;
		this.controller.destroy();
		this.destroy();
	}

	/**
	 * Destroys the engine and frees up memory.
	 */
	destroy() {
		log.info("Destroying Engine");
		if(typeof window !== 'undefined') {
			window.removeEventListener('resize', this._onResize);
		}

		this.detach();
		if(this.renderer) this.renderer.destroy();
	}
}
