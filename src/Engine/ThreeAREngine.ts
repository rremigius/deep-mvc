import Log from "@/log';
import Controller from "threear/dist/Controller";
import Engine from "@/Engine";

import * as THREEAR from 'threear';
import SceneModel from "@/models/SceneModel";
import {MarkerDetectedEvent} from "@/Engine/EngineInterface";
import ThreeRenderer from "@/renderers/threejs/ThreeRenderer";
import ThreeCamera from "@/renderers/threejs/ThreeObject/ThreeCamera";

const log = Log.instance("Engine/THREEAR");

const trackingLostDelay = 500;

export default class ThreeAREngine extends Engine {
	private tracking:boolean = false;
	private firstDetection:boolean = true;
	private lastTracked:number = 0;

	private arSource?:THREEAR.Source;
	private arController?:Controller;

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

	async initEngine(container:HTMLElement) {
		let parts = await super.initEngine(container);
		const renderer = parts.renderer;
		const camera = parts.camera;

		// Typeguard
		if(!this.checkRenderer(renderer) || !this.checkCamera(camera)) {
			return parts;
		}

		//@ts-ignore (THREEAR messed up the SourceParameter type so it requires all properties although in the code it doesn't).
		this.arSource = new THREEAR.Source({
			renderer: renderer.getWebGLRenderer(),
			camera: camera.getRenderObject(),
			parent: container
		});

		//@ts-ignore (THREEAR messed up the ControllerParameter type so it requires all properties although in the code it doesn't).
		this.arController = await THREEAR.initialize({ source: this.arSource });

		// Workaround for low-quality rendering bug (https://github.com/JamesMilnerUK/THREEAR/issues/52)
		let m = camera.getRenderObject().projectionMatrix;
		let far = 1000;
		let near = 0.1;
		m.elements[10] = -(far + near) / (far - near);
		m.elements[14] = -(2 * far * near) / (far - near);

		let patternMarker = new THREEAR.PatternMarker({
			patternUrl: this.xrScene.marker,
			markerObject: this.rootObject.getRenderObject()
		});

		// Because of the earlier ts-ignore, TS does not know we just set this.arController to a Controller.
		(<Controller>this.arController).trackMarker(patternMarker);

		return parts;
	}

	createCamera() {
		return new ThreeCamera();
	}

	frame() {
		super.frame();
		if(!this.arController || !this.arSource) {
			return;
		}
		this.rootObject.setVisible(false);
		this.arController.update( this.arSource.domElement );
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

		if(!this.arSource || !this.arController){
			return;
		}
		this.arSource.dispose();
		this.arController.dispose();
	}

	onResize() {
		super.onResize();
		if(!this.checkRenderer(this.renderer)) return;

		if(this.renderer && this.arController && this.arSource) {
			this.arController.onResize(this.renderer.getWebGLRenderer());
		}
	}
}
