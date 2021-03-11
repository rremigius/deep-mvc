import Log from "@/log';
import Engine from "@/Engine";

import SceneModel from "@/models/SceneModel";
import {MarkerDetectedEvent} from "@/Engine/EngineInterface";
import ThreeRenderer from "@/renderers/threejs/ThreeRenderer";
import ThreeCamera from "@/renderers/threejs/ThreeObject/ThreeCamera";
import {Object3D} from "three";
import ObjectRenderInterface from "@/renderers/common/ObjectRenderInterface";
import ThreeObject from "@/renderers/threejs/ThreeObject";
import Vector3 from "@/renderers/common/Vector3";

const log = Log.instance("Engine/ARjs");

const trackingLostDelay = 500;

// Loaded in index.html
const THREEx = (window as any).THREEx;

export default class ARjsEngine extends Engine {
	private tracking:boolean = false;
	private firstDetection:boolean = true;
	private lastTracked:number = 0;

	private arSource?:any; // ArToolkitSource
	private arContext?:any; // ArToolkitContext
	private arMarkerControls?:any; // ArMarkerControls

	private scalingObject?:ThreeObject;

	constructor(container:HTMLElement, xrScene:SceneModel) {
		super(container, xrScene);
		this.delaySceneStart = true;
	}

	checkRenderer(renderer:any):renderer is ThreeRenderer {
		if(!(renderer instanceof ThreeRenderer)) {
			throw new Error("Invalid WebGLRenderer");
		}
		return true;
	}

	checkCamera(camera:any):camera is ThreeCamera {
		if(!(camera instanceof ThreeCamera)) {
			throw new Error("Invalid THREE Camera");
		}
		return true;
	}

	createSceneRootObject() {
		const root = super.createSceneRootObject();

		// ARjs has a fixed scale for their markers, so we need a scaling object between the root and the rest
		this.scalingObject = new ThreeObject();
		this.scalingObject.setName("MarkerScaling");
		this.scalingObject.setScale(new Vector3(100,100,100));
		root.add(this.scalingObject);

		return root;
	}

	addToSceneRoot(object: ObjectRenderInterface<Object3D>) {
		if(!this.scalingObject) {
			throw new Error("ARjsEngine was not properly initialized. ScalingObject not yet created.");
		}
		this.scalingObject.add(object);
	}

	async initEngine(container:HTMLElement) {
		const parts = await super.initEngine(container);

		if(!this.checkCamera(parts.camera) || !this.checkRenderer(parts.renderer)) {
			log.error("Wrong engine parts.");
			return parts;
		}

		THREEx.ArToolkitContext.baseURL = '../';

		const camera = parts.camera.getRenderObject();

		log.info("Setting up ARToolkit...");
		this.arSource = new THREEx.ArToolkitSource({
			sourceType : 'webcam'
		})
		this.arSource.init(() => {
			// use a resize to fullscreen mobile devices
			setTimeout(() => {
				this.onResize();

				// Move video to be sibling of canvas
				const video = this.arSource.domElement;
				video.parentNode.removeChild(video);
				const canvasParent = parts.renderer.getDOMElement().parentNode;
				if(!canvasParent) {
					throw new Error("Canvas is not in DOM. Cannot move video.");
				}
				canvasParent.appendChild(video);
			}, 1000);
		});

		this.arContext = new THREEx.ArToolkitContext({
			detectionMode: 'mono'
		})
		this.arContext.init(() => {
			// copy projection matrix to camera
			camera.projectionMatrix.copy( this.arContext.getProjectionMatrix() );

			// Workaround for low-quality rendering bug (https://github.com/JamesMilnerUK/THREEAR/issues/52)
			let m = camera.projectionMatrix;
			let far = 1000;
			let near = 0.1;
			m.elements[10] = -(far + near) / (far - near);
			m.elements[14] = -(2 * far * near) / (far - near);
		});

		// init controls for camera
		log.info("Setting up marker...");
		this.arMarkerControls = new THREEx.ArMarkerControls(this.arContext, this.rootObject.getRenderObject(), {
			type : 'nft',
			descriptorsUrl : this.xrScene.marker,
			smooth: true,
			smoothCount: 10 // instead of default 5
		});

		// Seems that AR.js doesn't have a non-global event to listen to, so we listen to this event once.
		const loadingNFT = new Promise(resolve => {
			const listener = () => {
				resolve();
				window.removeEventListener('arjs-nft-loaded', listener);
			}
			window.addEventListener('arjs-nft-loaded', listener);
		});
		await loadingNFT;

		log.info("Marker loaded.");

		return parts;
	}

	createCamera() {
		return new ThreeCamera();
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
		let markerGroup = this.rootObject;
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
				this.startScene();
			}
			this.enableScene();
			log.info("Tracking marker.");

			// Fire event into EventBus
			this.eventBus.fire<MarkerDetectedEvent>(MarkerDetectedEvent.name, this, {id:"main", first: this.firstDetection});
		}
		if(!markerGroup.isVisible() && this.tracking) {
			this.tracking = false;
			log.info("Marker lost.");
			this.disableScene();
		}
	}

	stop() {
		super.stop();

		if(!this.arSource || !this.arContext){
			return;
		}
	}

	onResize() {
		super.onResize();

		this.arSource.onResizeElement();
		if(this.renderer) {
			this.arSource.copyElementSizeTo(this.renderer.getDOMElement());
		}
		if( this.arContext.arController !== null ){
			this.arSource.copyElementSizeTo(this.arContext.arController.canvas);
		}
	}
}
