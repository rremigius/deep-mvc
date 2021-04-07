import Log from "@/log";
import Controller from "threear/dist/Controller";

import * as THREEAR from 'threear';
import ThreeRenderer from "@/Engine/views/threejs/ThreeRenderer";
import EngineAbstract from "@/Engine/EngineAbstract";
import ThreeCamera from "@/Engine/views/threejs/ThreeObject/ThreeCamera";
import Source from "threear/dist/Source";
import ThreeRootObject from "@/Engine/views/threejs/ThreeViewRoot";
import {MarkerDetectedEvent} from "@/Engine/controllers/EngineController";

const log = Log.instance("engine/three-ar");

const trackingLostDelay = 500;

export default class ThreeAREngine extends EngineAbstract {
	protected renderer!:ThreeRenderer; // TS: created in constructor

	private tracking:boolean = false;
	private firstDetection:boolean = true;
	private lastTracked:number = 0;

	private arSource!:THREEAR.Source; // TS: initialized in init
	private arController!:Controller; // TS: initialized in init

	get camera() {
		const camera = super.camera;
		if(!(camera instanceof ThreeCamera)) {
			throw new Error("ThreeAREngine requires a ThreeCamera to work.");
		}
		return camera;
	}

	async init() {
		this.arSource = this.createARSource();

		// Workaround for low-quality rendering bug (https://github.com/JamesMilnerUK/THREEAR/issues/52)
		let m = this.camera.getObject3D().projectionMatrix;
		let far = 1000;
		let near = 0.1;
		m.elements[10] = -(far + near) / (far - near);
		m.elements[14] = -(2 * far * near) / (far - near);

		const scene = this.controller.scene.get();
		if(!scene) throw new Error("No Scene in Engine.");

		const root = this.controller.root;
		if(!(root instanceof ThreeRootObject)) {
			throw new Error("EngineController root is not a Three Object.");
		}

		let patternMarker = new THREEAR.PatternMarker({
			patternUrl: scene.model.marker,
			// TS: missing property 'applyMatrix' of imported three vs ThreeAR's three
			markerObject: root.getObject3D() as any
		});

		// Because of the earlier ts-ignore, TS does not know we just set this.arController to a Controller.
		this.arController.trackMarker(patternMarker);
	}

	async load() {
		// TS: Somehow, ThreeAR Source from their dist is incompatible with the one from their src
		this.arController = await this.createARController(this.arSource as any);
	}

	createRenderer() {
		return new ThreeRenderer();
	}

	createARSource() {
		if(!this.camera) throw new Error("No Camera in Scene");
		const container = new HTMLDivElement();
		container.setAttribute('id', 'ar-source');

		// TS: THREEAR messed up the SourceParameter type so it requires all properties although in the code it doesn't
		return new THREEAR.Source({
			renderer: this.renderer.renderer as any,
			camera: this.camera.getObject3D() as any,
			parent: container
		});
	}

	async createARController(arSource:Source) {
		//@ts-ignore (THREEAR messed up the ControllerParameter type so it requires all properties although in the code it doesn't).
		return await THREEAR.initialize({ source: arSource });
	}

	frame() {
		super.frame();
		if(!this.arController || !this.arSource) {
			return;
		}
		this.controller.root.setVisible(false);
		this.arController.update( this.arSource.domElement );
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
				this.controller.start(false);
			}
			this.controller.enable(true);
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

		if(this.renderer && this.arController && this.arSource) {
			// TS: missing property in imported three compared to ThreeAR's three
			this.arController.onResize(this.renderer.renderer as any);
		}
	}
}
