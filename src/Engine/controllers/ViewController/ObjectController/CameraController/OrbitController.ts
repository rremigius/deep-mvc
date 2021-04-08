import Controller from "@/Controller";
import OrbitControlsModel from "@/Engine/models/ObjectModel/CameraModel/OrbitControlsModel";
import CameraController from "../CameraController";
import IOrbitControls, {IOrbitControlsSymbol} from "@/Engine/views/common/IObjectView/ICameraView/IOrbitControls";
import Log from "@/log";
import Engine from "@/Engine/Engine";
import {immediate, schema} from "mozel";

const log = Log.instance("orbit-controller");

export default class OrbitController extends Controller {
	static ModelClass = OrbitControlsModel;
	model!:OrbitControlsModel;

	orbitParent?:CameraController;
	controls!:IOrbitControls;

	init(model: OrbitControlsModel) {
		super.init(model);
		this.controls = this.viewFactory.get<IOrbitControls>(IOrbitControlsSymbol);

		const s = schema(OrbitControlsModel);
		this.model.$watch(s.rotateSpeed, speed => this.controls.setRotateSpeed(speed), {immediate});
		this.model.$watch(s.maxPolarAngle, angle => this.controls.setMaxPolarAngle(angle), {immediate});
		this.model.$watch(s.minDistance, distance => this.controls.setMinDistance(distance), {immediate});
		this.model.$watch(s.maxDistance, distance => this.controls.setMaxDistance(distance), {immediate});
		this.model.$watch(s.enableZoom, zoom => this.controls.setZoomEnabled(zoom), {immediate});
	}

	setParent(parent?: Controller) {
		if(parent && !(parent instanceof CameraController)) {
			throw new Error(`OrbitController can only be a child of CameraController; not of ${parent.static.name}`);
		}
		super.setParent(parent);
		if(!parent) return;

		(async () => {
			// We need to wait for the parent to initialize; setParent is called first time before initialization of parent
			await parent.loading.wait();
			if(!(parent === this.parent)) {
				log.info("Parent changed before OrbitControls were setup.");
				return;
			}
			this.setupOrbitControls(parent);
		})();
	}

	setupOrbitControls(parent:CameraController) {
		log.info("Setting up OrbitControls.");

		const engine = this.dependencies.get(Engine);

		const domElement = engine.domElement;
		this.controls.setupOrbitControls(parent.view, domElement);
	}
}
