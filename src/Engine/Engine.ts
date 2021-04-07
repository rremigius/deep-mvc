import EngineModel from "@/Engine/models/EngineModel";
import ControllerFactory from "@/Controller/ControllerFactory";
import ViewFactory from "@/Engine/views/ViewFactory";
import IRenderer from "@/Engine/views/common/IRenderer";

import Log from "@/log";
import EngineController, {FrameEvent} from "@/Engine/controllers/ViewController/EngineController";
import EngineControllerFactory from "@/Engine/controllers/EngineControllerFactory";
import HeadlessViewFactory from "@/Engine/views/headless/HeadlessViewFactory";

const log = Log.instance("engine");

export default class Engine {
	private container?:HTMLElement;
	private _onResize!:()=>void;

	protected running = false;
	protected readonly renderer:IRenderer;
	protected readonly controller:EngineController;

	readonly loading?:Promise<void>;

	constructor(model:EngineModel, viewFactory?:ViewFactory, controllerFactory?:ControllerFactory) {
		viewFactory = viewFactory || this.createDefaultViewFactory();
		controllerFactory = controllerFactory || this.createDefaultControllerFactory(viewFactory);

		this.controller = controllerFactory.createAndResolveReferences(model, EngineController);
		this.renderer = viewFactory.createRenderer();

		if(typeof window !== 'undefined') {
			this._onResize = this.onResize.bind(this);
			window.addEventListener('resize', this._onResize);
		}

		this.init();
		this.loading = this.load();
	}

	init(){ }

	createDefaultControllerFactory(viewFactory:ViewFactory):ControllerFactory {
		return new EngineControllerFactory(viewFactory);
	}

	createDefaultViewFactory():ViewFactory {
		return new HeadlessViewFactory();
	}

	get camera() {
		const cameraController = this.controller.camera.get();
		if(!cameraController) return undefined;
		return cameraController.view;
	}

	get events() {
		return this.controller.events;
	}

	get static() {
		return <typeof Engine>this.constructor;
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

	async load() {
		return this.controller.load();
	}

	start() {
		this.running = true;
		this.controller.start();
		this.animate();
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
