import {injectable} from "@/Controller/dependencies";
import EngineModel from "@/Engine/models/EngineModel";
import Controller, {controller} from "@/Controller";
import {schema} from "mozel";
import SceneController from "@/Engine/controllers/SceneController";
import ControllerSlot from "@/Controller/ControllerSlot";
import ControllerModel from "@/ControllerModel";
import {Container} from "inversify";
import ControllerFactory from "@/Controller/ControllerFactory";
import ViewFactory from "@/Engine/views/ViewFactory";
import IRenderer from "@/Engine/views/common/IRenderer";
import CameraController from "@/Engine/controllers/ObjectController/CameraController";
import defaultControllerDependencies from "@/Engine/controllers/dependencies";
import defaultViewDependencies from "@/Engine/views/headless/dependencies";

import Log from "@/log";
import {remove} from "lodash";
import {FrameListener} from "@/Engine";

const log = Log.instance("engine");

/**
 * The Engine itself should not be an active part of its own rendering hierarchy, but we can add an EngineController that allows
 * other Controllers to contact the Engine.
 */
@injectable()
export default class EngineController extends Controller {
	static ModelClass = EngineModel;
	model!:EngineModel;

	@controller(schema(EngineModel).scene, SceneController)
	scene!:ControllerSlot<SceneController>;

	@controller(schema(EngineModel).camera, CameraController)
	camera!:ControllerSlot<CameraController>;

	private container?:HTMLElement;
	private renderer!:IRenderer;
	private _onResize!:()=>void;
	protected readonly frameListeners:FrameListener[] = [];

	static create(model:EngineModel, viewDependencies?:Container, controllerDependencies?:Container) {
		controllerDependencies = controllerDependencies || this.getDefaultControllerDependencies();
		viewDependencies = viewDependencies || this.getDefaultViewDependencies();

		const viewFactory = new ViewFactory(viewDependencies);

		const dependencies = new Container();
		dependencies.parent = controllerDependencies || null;
		dependencies.bind<ViewFactory>(ViewFactory).toConstantValue(viewFactory);

		const controllerFactory = new ControllerFactory(dependencies);
		return controllerFactory.create(model, EngineController);
	}

	static getDefaultControllerDependencies() {
		return defaultControllerDependencies;
	}

	static getDefaultViewDependencies() {
		return defaultViewDependencies;
	}

	init(model: ControllerModel) {
		super.init(model);

		this._onResize = this.onResize.bind(this);
		if(typeof window !== 'undefined') {
			window.addEventListener('resize', this._onResize);
		}

		// TODO: Test if EngineController can be retrieved from other controllers
		this.dependencies.bind<EngineController>(EngineController).toConstantValue(this);
	}

	attach(container:HTMLElement) {
		this.container = container;
	}

	detach() {
		this.container = undefined;
	}

	render() {
		const camera = this.camera.get();
		const scene = this.scene.get();
		if(!camera || !scene) return;

		if(this.renderer) {
			this.renderer.render(scene.view, camera.view);
		}
	}

	private animate() {
		// run the rendering loop
		this.frame();
		this.render();

		// keep looping
		if(this.enabled) {
			requestAnimationFrame( this.animate.bind(this) );
		}
	}

	addFrameListener(frameListener:FrameListener) {
		log.log("Registering frame listener", frameListener);
		this.frameListeners.push(frameListener);
	}
	removeFrameListener(frameListener:FrameListener) {
		log.log("Removing frame listener", frameListener);
		remove(this.frameListeners, (item:FrameListener) => item === frameListener);
	}

	/**
	 * Updates the state of the Scene. Called every animation frame. Override for control over the update loop.
	 * Calls all frame listeners to do their thing
	 */
	frame() {
		this.frameListeners.forEach((listener:FrameListener) => {
			listener.frame();
		});
	}

	onResize() {
		if(this.container) {
			let height = this.container.clientHeight;
			let width = this.container.clientWidth;

			this.renderer.setSize(width, height);

			const camera = this.camera.get();
			if(camera) {
				camera.setAspectRatio(width / height);
			}
		}
	}

	stop() {
		this.enable(false);
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
