import EngineModel from "@/Engine/models/EngineModel";
import ComponentFactory from "@/Component/ComponentFactory";

import Log from "@/log";
import EngineController from "@/Engine/controllers/EngineController";
import EngineControllerFactory from "@/Engine/controllers/EngineControllerFactory";
import {Events} from "@/EventEmitter";
import {Registry} from "mozel";
import Controller from "@/Controller";
import ViewFactory from "@/View/ViewFactory";
import EngineView from "@/Engine/views/EngineView";

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
	protected readonly controller:EngineController;
	protected readonly view:EngineView;

	readonly loading?:Promise<unknown>;

	protected _events = new EngineEvents();
	get events() { return this._events };

	constructor(model:EngineModel, viewFactory?:ViewFactory, controllerFactory?:ComponentFactory) {
		controllerFactory = controllerFactory || this.createDefaultControllerFactory();
		viewFactory = viewFactory || this.createDefaultViewFactory(controllerFactory.registry);

		// Allow access to Engine from Components
		controllerFactory.dependencies.bind(Engine).toConstantValue(this);

		this.controller = controllerFactory.create(model, EngineController);
		this.controller.setEngine(this);
		this.controller.resolveReferences(); // split from `create` so engine is available in onResolveReferences

		this.view = viewFactory.create(model, EngineView);
		this.view.resolveReferences(); // split from `create` so engine is available in onResolveReferences

		if(typeof window !== 'undefined') {
			this._onResize = this.onResize.bind(this);
			window.addEventListener('resize', this._onResize);
		}

		this.init();
		this.loading = this.load();
	}

	init(){ }

	createDefaultControllerFactory():ComponentFactory {
		return new EngineControllerFactory();
	}

	createDefaultViewFactory(controllerRegistry:Registry<Controller>):ViewFactory {
		return new ViewFactory(controllerRegistry);
	}

	get static() {
		return <typeof Engine>this.constructor;
	}

	attach(container:HTMLElement) {
		this._container = container;
		this.view.attachTo(container);
		this.onResize();
	}

	detach() {
		if(!this._container) return;
		this.view.detach();
		this._container = undefined;
	}

	render() {
		this.view.render();
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

			this.view.setSize(width, height);
		}
	}

	async load() {
		return Promise.all([
			this.controller.load(),
			this.view.load()
		]);
	}

	start() {
		this.running = true;
		this.controller.start();
		this.view.start();
		this.animate();
	}

	stop() {
		this.running = false;
		this.controller.destroy();
		this.view.destroy();
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
	}
}
