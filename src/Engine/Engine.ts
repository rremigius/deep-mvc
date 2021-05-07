import EngineModel from "@/Engine/models/EngineModel";
import ControllerFactory from "@/Controller/ControllerFactory";
import ViewFactory from "@/Engine/views/ViewFactory";
import IRenderer from "@/Engine/views/common/IRenderer";

import Log from "@/log";
import EngineController from "@/Engine/controllers/EngineController";
import EngineControllerFactory from "@/Engine/controllers/EngineControllerFactory";
import HeadlessViewFactory from "@/Engine/views/headless/HeadlessViewFactory";
import {Events} from "@/EventEmitter";

const log = Log.instance("engine");

export class FrameEvent {
	constructor(public timestamp:number) {}
}
export class EngineEvents extends Events {
	frame = this.$event(FrameEvent);
}

export default class Engine {
	private _container?:HTMLElement;
	public get container() { return this._container }

	private readonly _onResize!:()=>void;

	protected running = false;
	protected readonly renderer:IRenderer;
	protected readonly controller:EngineController;

	readonly loading?:Promise<void>;

	protected _events = new EngineEvents();
	get events() { return this._events };

	constructor(model:EngineModel, viewFactory?:ViewFactory, controllerFactory?:ControllerFactory) {
		viewFactory = viewFactory || this.createDefaultViewFactory();
		controllerFactory = controllerFactory || this.createDefaultControllerFactory(viewFactory);

		this.renderer = viewFactory.createRenderer();

		// Allow access to Engine from Controllers
		const dependencies = controllerFactory.extendDependencies();
		dependencies.bind(Engine).toConstantValue(this);

		this.controller = controllerFactory.create(model, EngineController);
		this.controller.resolveReferences(); // split from `create` so engine.controller is available in onResolveReferences
		this.initController(this.controller);

		if(typeof window !== 'undefined') {
			this._onResize = this.onResize.bind(this);
			window.addEventListener('resize', this._onResize);
		}

		this.init();
		this.loading = this.load();
	}

	init(){ }

	initController(controller:EngineController) {
		this.controller.setEngine(this);
	}

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

	get scene() {
		const sceneController = this.controller.scene.get();
		if(!sceneController) return undefined;
		return sceneController.view;
	}

	get domElement() {
		return this.renderer.getDOMElement();
	}

	get static() {
		return <typeof Engine>this.constructor;
	}

	attach(container:HTMLElement) {
		this._container = container;
		this.renderer.attachTo(container);
		this.onResize();
	}

	detach() {
		if(!this._container) return;
		this.renderer.detach();
		this._container = undefined;
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
		this.events.frame.fire(new FrameEvent(Date.now()));
	}

	onResize() {
		if(this._container) {
			let height = this._container.clientHeight;
			let width = this._container.clientWidth;

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
