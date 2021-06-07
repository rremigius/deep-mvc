import EngineModel from "@examples/game-engine/models/EngineModel";
import ComponentFactory from "@/Component/ComponentFactory";

import Log from "@/log";
import EngineControllerFactory from "@examples/game-engine/controllers/EngineControllerFactory";
import {Events} from "@/EventEmitter";
import ViewFactory from "@/View/ViewFactory";
import EngineView from "@examples/game-engine/views/EngineView";
import Component from "@/Component";
import {forEach, map} from "lodash";
import View from "../../src/View";

const log = Log.instance("engine");

export class FrameEvent {
	constructor(public timestamp:number) {}
}
export class KeyboardEvent {
	constructor(public key:string) {}
}
export class EngineEvents extends Events {
	frame = this.$event(FrameEvent);
	keyUp = this.$event(KeyboardEvent);
}

export default class Engine {
	static createDefaultControllerFactory() {
		return new EngineControllerFactory();
	}

	private _container?:HTMLElement;
	public get container() { return this._container }

	private readonly _onResize!:()=>void;

	protected started = false;
	protected running = false;

	protected readonly rootComponents:Record<string, Component>;

	readonly loading?:Promise<unknown>;
	private loaded = false;

	protected _events = new EngineEvents();
	get events() { return this._events };

	constructor(model:EngineModel) {
		const componentFactories = this.createComponentFactories();

		this.rootComponents = {};
		for(let name in componentFactories) {
			log.info("Generating components: ", name);
			const factory = componentFactories[name];

			// Allow access to Engine from Components
			factory.dependencies.bind(Engine).toConstantValue(this);
			const component = factory.createAndResolveReferences(model, Component);
			this.rootComponents[name] = component;

			// Debug
			log.log(`${name}:`, component.toTree());
		}

		if(typeof window !== 'undefined') {
			this._onResize = this.onResize.bind(this);
			window.addEventListener('resize', this._onResize);
		}

		this.init();
		this.loading = this.load();
		this.loading.then(()=>this.loaded = true);
	}

	init(){ }

	createComponentFactories():Record<string, ComponentFactory> {
		const controllerFactory = new EngineControllerFactory();
		return {
			controller: controllerFactory,
			view: new ViewFactory(controllerFactory.registry)
		};
	}

	get static() {
		return <typeof Engine>this.constructor;
	}

	attach(container:HTMLElement|Record<string, HTMLElement>) {
		if(container instanceof HTMLElement) {
			// Attach all to same container
			forEach(this.rootComponents, component => {
				if(!(component instanceof View)) return;
				component.mount(container);
			});
		} else {
			// Attach all to different containers
			for(let name in container) {
				const component = this.rootComponents[name];
				if(!(component instanceof View)) {
					throw new Error(`RootComponent '${name}' is not an EngineView and cannot be attached to the page.`);
				}
				component.mount(container[name]);
			}
		}
		this.onResize();
	}

	detach() {
		for(let name in this.rootComponents) {
			const component = this.rootComponents[name];
			if(!(component instanceof View)) {
				continue;
			}
			component.dismount();
		}
	}

	getRootComponent(name:string) {
		return this.rootComponents[name];
	}

	render() {
		forEach(this.rootComponents, component => {
			if(component instanceof EngineView) {
				component.render();
			}
		});
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
		forEach(this.rootComponents, component => {
			if(!(component instanceof EngineView)) return;
			component.resize();
		});
	}

	async load() {
		return Promise.all(map(this.rootComponents, component => component.load()));
	}

	get isLoaded() {
		return this.loaded;
	}

	get isRunning() {
		return this.running;
	}

	get isStarted() {
		return this.started;
	}

	keyUp(key:string) {
		log.debug("Key up:", key);
		this.events.keyUp.fire(new KeyboardEvent(key));
	}

	start() {
		this.started = true;
		forEach(this.rootComponents, component => component.start());
		this.resume();
	}

	resume() {
		this.running = true;
		forEach(this.rootComponents, component => component.enable(true));
		this.animate();
	}

	pause() {
		this.running = false;
		forEach(this.rootComponents, component => component.enable(false));
	}

	destroy() {
		log.info("Destroying Engine...");
		this.pause();

		forEach(this.rootComponents, component => component.destroy);
		if(typeof window !== 'undefined') {
			window.removeEventListener('resize', this._onResize);
		}

		this.detach();
		log.info("Engine destroyed.");
	}
}
