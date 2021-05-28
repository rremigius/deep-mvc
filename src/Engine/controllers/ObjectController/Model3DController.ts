import ObjectController from "@/Engine/controllers/ObjectController";
import Model3DModel from "@/Engine/models/ObjectModel/Model3DModel";
import {ComponentEvent} from "@/Component";
import {ViewControllerEvents} from "@/Controller/ViewController";
import Log from "@/log";

const log = Log.instance("model3d-controller");

export class MeshClickEvent extends ComponentEvent<{mesh:string}> {}
export class Model3DControllerEvents extends ViewControllerEvents {
	meshClick = this.$event(MeshClickEvent);
}

export default class Model3DController extends ObjectController {
	static Model = Model3DModel;
	model!:Model3DModel;

	events!:Model3DControllerEvents;

	onSetupEventsAndActions() {
		super.onSetupEventsAndActions();
		this.events = new Model3DControllerEvents();
	}

	clickMesh(mesh:string) {
		log.info("Mesh clicked:", mesh);
		this.events.meshClick.fire(new MeshClickEvent(this, {mesh: mesh}));
	}
}
