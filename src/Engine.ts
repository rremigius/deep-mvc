import SceneModel from "@/models/SceneModel";

import Log from "@/log";
import Loading from "deep-loader";

import SceneController from "@/Controller/SceneController";
import ControllerFactory from "@/Controller/ControllerFactory";
import {Container, inject} from "inversify";
// Make THREE rendering classes available in THREE container
import "./renderers/threejs/all";
import threeContainer from "@/renderers/threejs/inversify";

import {remove} from 'lodash';
import EventBus from "@/EventBus";
import SceneRenderInterface from "@/renderers/common/ObjectRenderInterface/SceneRenderInterface";
import CameraRenderInterface from "@/renderers/common/ObjectRenderInterface/CameraRenderInterface";
import RenderFactory from "@/renderers/RenderFactory";
import RendererInterface from "@/renderers/common/RendererInterface";
import ObjectRenderInterface from "@/renderers/common/ObjectRenderInterface";
import LightRenderInterface from "@/renderers/common/ObjectRenderInterface/LightRenderInterface";
import EngineInterface, {EngineActions, EngineEvents} from "@/Engine/EngineInterface";
import {Constructor} from "validation-kit";
import EventEmitter, {callback} from "@/EventEmitter";

const log = Log.instance("Engine");

export type FrameListener = {
	frame:()=>void
};

export default class Engine implements EngineInterface {
	protected delaySceneStart: boolean = false;

	camera?:CameraRenderInterface
	protected scene?:SceneRenderInterface;
	protected renderer?:RendererInterface;

	protected css3dRenderer?:RendererInterface;
	protected rootObject:ObjectRenderInterface;

	protected container: HTMLElement;
	protected xrScene: SceneModel;
	protected eventBus: EventBus;

	public actions = new EngineActions();
	public events = new EngineEvents();

	/**
	 * ControllerFactory to set up the Engine elements. Initialize with default container from Engine/inversify.
	 */
	@inject(ControllerFactory)
	protected xrControllerFactory!:ControllerFactory;

	protected readonly frameListeners:FrameListener[] = [];

	private running:boolean = false;
	private readonly sceneController:SceneController;
	protected readonly renderFactory:RenderFactory;

	readonly loading:Loading = new Loading('Engine');

	private readonly _onResize:()=>void;

	constructor(container:HTMLElement, xrScene:SceneModel){
		this.container = container;
		this.xrScene = xrScene;
		this.eventBus = new EventBus();
		this.renderFactory = this.createRenderFactory();

		this.rootObject = this.createSceneRootObject();

		const diContainer = new Container();

		// Override RenderFactory with the given one
		diContainer.bind<RenderFactory>(RenderFactory).toConstantValue(this.renderFactory);

		this.xrControllerFactory = new ControllerFactory(this, diContainer);

		this.sceneController = this.createSceneController(this.xrScene);
		log.log("Created SceneController", this.sceneController);

		this._onResize = this.onResize.bind(this);
		window.addEventListener('resize', this._onResize);

		this.init(container);
	}

	/**
	 * Initializes the Engine with the given container and sceneGroup.
	 * @param {HTMLElement} container				The container in which to place the rendered content.
	 */
	async init(container:HTMLElement) {
		this.container = container;

		log.info("Initializing Engine");

		this.loading.start('main');

		let {camera, scene, renderer} = await this.initEngine(container);
		this.camera = camera;
		this.scene = scene;
		this.renderer = renderer;

		this.attach(container);

		scene.add(this.rootObject);

		try {
			await this.sceneController.load();
			this.loading.finish("main");
			this.addToSceneRoot(this.sceneController.root);
		} catch(e) {
			log.error("Could not load scene.", e);
			this.loading.error('main', e);
		}
	}

	addToSceneRoot(object:ObjectRenderInterface) {
		this.rootObject.add(object);
	}

	createSceneRootObject() {
		const root = this.renderFactory.create<ObjectRenderInterface>("ObjectRenderInterface");
		root.setName("Root");
		return root;
	}

	createSceneController(xrScene:SceneModel) {
		return this.xrControllerFactory.create<SceneController>(SceneController, xrScene, true);
	}

	/**
	 * Creates the engine's Camera, Scene and Renderer, and attaches the renderer to the container.
	 * Calls createCamera, createScene and createRenderer. Can be overridden if all three are returned, and the renderer is attached.
	 *
	 * @param {HTMLElement} container				The container to attach the renderer to.
	 * @return {camera:Camera, scene:ObjectInterface, renderer:WebGLRenderer, attached:boolean}
	 */
	async initEngine(container:HTMLElement) {
		let camera = this.createCamera();
		let renderer = this.createRenderer();
		let scene = this.createScene(camera);

		return {camera, renderer, scene};
	}

	registerAction<T>(ActionClass:Constructor<T>, callback:callback<T>, name?:string):EventEmitter<T> {
		if(!name) name = ActionClass.name;
		const event = this.actions.$event(ActionClass, name);
		// TS: The runtime type checking should take care of the event before it fires
		this.actions.$on(name, callback as callback<unknown>);
		return event;
	}

	/**
	 * Creates a Camera for use in the Engine.
	 */
	createCamera():CameraRenderInterface {
		const camera = this.renderFactory.create<CameraRenderInterface>("CameraRenderInterface");
		camera.setPosition({z: 5});

		return camera;
	}

	/**
	 * Creates a Renderer for use in the Engine
	 */
	createRenderer():RendererInterface {
		return this.renderFactory.get<RendererInterface>("RendererInterface");
	}

	/**
	 * Creates a RenderFactory for use in the Engine and Controllers
	 */
	createRenderFactory() {
		return new RenderFactory(threeContainer);
	}

	/**
	 * Creates a SceneRenderInterface containing the camera and the sceneGroup.
	 * @param {CameraRenderInterface} camera
	 */
	createScene(camera: CameraRenderInterface): SceneRenderInterface {
		const scene = this.renderFactory.create<SceneRenderInterface>("SceneRenderInterface");

		// Add lights
		const light = this.renderFactory.create<LightRenderInterface>("LightRenderInterface");
		scene.add(light);

		// Add camera
		scene.add(camera);

		return scene;
	}

	/**
	 * Attaches the renderers to the container.
	 * @param {HTMLElement} container
	 * @param {RendererInterface} renderer	A specific renderer to attach.
	 */
	attach(container:HTMLElement) {
		this.container = container;

		if(!this.renderer) {
			log.error("Cannot attach renderers. Not initialized.");
			return false;
		}
		this.renderer.attachTo(container);
	}

	/**
	 * Detaches the (given) renderer from the given container.
	 * @param {WebGLRenderer} [renderer]
	 */
	detach() {
		if(!this.renderer) return;

		this.renderer.detach();
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

	/**
	 * Start the Engine and the Scene in it.
	 */
	start() {
		this.onResize();
		this.running = true;
		this.animate();
		if(!this.delaySceneStart) {
			this.startScene();
		}
	}

	/**
	 * Start the Scene.
	 */
	startScene() {
		log.info("Starting Scene.");
		this.sceneController.start();
	}

	enableScene() {
		log.info("Enabling Scene.");
		this.sceneController.enable(true);
	}

	disableScene() {
		log.info("Disabling Scene.");
		this.sceneController.enable(false);
	}

	/**
	 * Stop tracking and rendering.
	 */
	stop() {
		this.running = false;
		this.sceneController.destroy();
	}

	render() {
		if(!this.camera || !this.scene) return;
		if(this.renderer) {
			this.renderer.render(this.scene, this.camera);
		}
		if(this.css3dRenderer) {
			this.css3dRenderer.render(this.scene, this.camera);
		}
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
	 * Matches the size and aspect ratio of the renderer and camera with the container.
	 */
	onResize() {
		if(this.renderer && this.container) {
			let height = this.container.clientHeight;
			let width = this.container.clientWidth;

			this.renderer.setSize(width, height);

			if(this.camera) {
				this.camera.setAspectRatio(width / height);
			}
		}
	}

	/**
	 * Destroys the engine and frees up memory.
	 */
	destroy() {
		log.info("Destroying Engine");
		window.removeEventListener('resize', this._onResize);

		this.detach();
		if(this.renderer) this.renderer.destroy();
	}
}
