import Controller from "@/Controller";
import OrbitControlsModel from "@/Engine/models/ObjectModel/CameraModel/OrbitControlsModel";
import CameraController from "../CameraController";
import IOrbitControls, {IOrbitControlsSymbol} from "@/Engine/views/common/IObjectView/ICameraView/IOrbitControls";
import EngineController from "@/Engine/controllers/EngineController";
import Log from "@/log";
import Engine from "@/Engine/Engine";

const log = Log.instance("orbit-controller");

export default class OrbitController extends Controller {
	static ModelClass = OrbitControlsModel;
	model!:OrbitControlsModel;

	setParent(parent?: Controller) {
		if(parent && !(parent instanceof CameraController)) {
			throw new Error(`OrbitController can only be a child of CameraController; not of ${parent.static.name}`);
		}
		super.setParent(parent);
		if(!parent) return;
		this.setupOrbitControls(parent).catch(()=>{
			log.error("OrbitControls setup failed on new CameraController.");
		})
	}

	async setupOrbitControls(parent:CameraController) {
		await parent.loading.wait();

		if(!(parent === this.parent)) {
			log.info("Parent changed before OrbitControls were setup.");
			return;
		}
		log.info("Setting up OrbitControls.");

		const engine = this.dependencies.get(Engine);

		const domElement = engine.domElement;
		const controls = this.viewFactory.get<IOrbitControls>(IOrbitControlsSymbol);
		controls.setupOrbitControls(parent.view, this.model, domElement);
	}
}
