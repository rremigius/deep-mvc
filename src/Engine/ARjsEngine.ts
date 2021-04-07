import Engine from "./Engine";
import IRenderer from "@/Engine/views/common/IRenderer";
import ThreeRenderer from "@/Engine/views/threejs/ThreeRenderer";
import ThreeCamera from "@/Engine/views/threejs/ThreeObject/ThreeCamera";
import Log from "@/log";
import {Camera} from "three";
import Vector3 from "@/Engine/views/common/Vector3";
import {MarkerDetectedEvent} from "@/Engine/controllers/ViewController/EngineController";
import ThreeViewFactory from "./views/threejs/ThreeViewFactory";

// Should be loaded in index.html
const THREEx = (window as any).THREEx;

const log = Log.instance("engine/arjs");
const trackingLostDelay = 500;

export default class ARjsEngine extends Engine {
	private tracking:boolean = false;
	private firstDetection:boolean = true;
	private lastTracked:number = 0;

	private arSource!:any; // ArToolkitSource
	private arContext!:any; // ArToolkitContext
	private arMarkerControls?:any; // ArMarkerControls

	protected renderer!:ThreeRenderer; // TS: created in constructor

	get camera() {
		const camera = super.camera;
		if(!(camera instanceof ThreeCamera)) throw new Error("Camera is not a ThreeCamera.");
		return camera;
	}

	init() {
		log.info("Setting up ARToolkit...");

		this.arSource = this.createARSource(this.renderer.renderer.domElement);
		this.arContext = this.createARContext(this.camera.getObject3D());

		// init controls for camera
		log.info("Setting up marker...");
		this.arMarkerControls = this.createARMarkerControls();

		// ARjs has a fixed scale for their markers, so we need a scaling object between the root and the rest
		const scale = this.controller.model.scale;
		this.controller.root.setScale(new Vector3(scale, scale, scale));
	}

	createRenderer(): IRenderer {
		return new ThreeRenderer();
	}

	createDefaultViewFactory() {
		return new ThreeViewFactory();
	}

	async load() {
		// Seems that AR.js doesn't have a non-global event to listen to, so we listen to this event once.
		return new Promise<void>(resolve => {
			const listener = () => {
				log.info("Marker loaded.");
				resolve();
				window.removeEventListener('arjs-nft-loaded', listener);
			}
			window.addEventListener('arjs-nft-loaded', listener);
		});
	}

	/**
	 * @param {HTMLCanvasElement} canvas	The renderer's HtmlElement.
	 */
	createARSource(canvas:HTMLCanvasElement) {
		const source = new THREEx.ArToolkitSource({
			sourceType : 'webcam'
		})
		source.init(() => {
			// use a resize to fullscreen mobile devices
			setTimeout(() => {
				this.onResize();

				// Move video to be sibling of canvas
				const video = this.arSource.domElement;
				video.parentNode.removeChild(video);
				const canvasParent = canvas.parentNode;
				if(!canvasParent) {
					throw new Error("Canvas is not in DOM. Cannot move video.");
				}
				canvasParent.appendChild(video);
			}, 1000);
		});
		return source;
	}

	createARContext(camera:Camera) {
		const context = new THREEx.ArToolkitContext({
			detectionMode: 'mono',
			cameraParametersUrl: THREEx.ArToolkitContext.baseURL + 'data/camera_para.dat'
		})
		context.init(() => {
			// copy projection matrix to camera
			camera.projectionMatrix.copy( this.arContext.getProjectionMatrix() );

			// Workaround for low-quality rendering bug (https://github.com/JamesMilnerUK/THREEAR/issues/52)
			let m = camera.projectionMatrix;
			let far = 1000;
			let near = 0.1;
			m.elements[10] = -(far + near) / (far - near);
			m.elements[14] = -(2 * far * near) / (far - near);
		});
		return context;
	}

	createARMarkerControls() {
		const scene = this.controller.scene.get();
		if(!scene) throw new Error("No Scene in Engine");

		this.arMarkerControls = new THREEx.ArMarkerControls(this.arContext, this.controller.view, {
			type : 'nft',
			descriptorsUrl : scene.model.marker,
			smooth: true,
			smoothCount: 10 // instead of default 5
		});
	}

	frame() {
		super.frame();
		if (!this.arSource.ready) {
			return;
		}

		this.arContext.update(this.arSource.domElement)

		this.updateDetection();
	}

	protected updateDetection() {
		let markerGroup = this.controller.root;
		if(!markerGroup) {
			return; // nothing else to do
		}
		if(markerGroup.isVisible()) {
			this.lastTracked = Date.now();
		}

		// We're losing the target
		if(this.tracking && !markerGroup.isVisible()) {
			// Time we didn't see target is still within margin
			if (Date.now() - this.lastTracked < trackingLostDelay) {
				markerGroup.setVisible(true);
			}
		}

		if(markerGroup.isVisible() && !this.tracking) {
			this.tracking = true;
			if(this.firstDetection) {
				log.info("First detection! Starting Scene.");
				this.firstDetection = false;
				this.controller.start(false); // will be enabled below
			}
			this.controller.enable();
			log.info("Tracking marker.");

			// Fire event into EventBus
			this.controller.eventBus.$fire(new MarkerDetectedEvent("main", this.firstDetection));
		}
		if(!markerGroup.isVisible() && this.tracking) {
			this.tracking = false;
			log.info("Marker lost.");
			this.controller.enable(false);
		}
	}

	onResize() {
		super.onResize();

		this.arSource.onResizeElement();
		if(this.renderer) {
			this.arSource.copyElementSizeTo(this.renderer.renderer.domElement);
		}
		if( this.arContext.arController !== null ){
			this.arSource.copyElementSizeTo(this.arContext.arController.canvas);
		}
	}
}
