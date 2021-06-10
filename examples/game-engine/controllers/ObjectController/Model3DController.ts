import ObjectController, {ObjectControllerEvents} from "@examples/game-engine/controllers/ObjectController";
import Model3DModel from "@examples/game-engine/models/ObjectModel/Model3DModel";
import {ComponentEvent} from "@/Component";
import Log from "@/log";

const log = Log.instance("model3d-controller");

export class MeshClickEvent extends ComponentEvent<{mesh:string}> {}
export class Model3DControllerEvents extends ObjectControllerEvents {
	meshClick = this.$event(MeshClickEvent);
}

export default class Model3DController extends ObjectController {
	static Model = Model3DModel;
	model!:Model3DModel;

	static Events = Model3DControllerEvents;
	events!:Model3DControllerEvents;

	clickMesh(mesh:string) {
		log.info("Mesh clicked:", mesh);
		this.events.meshClick.fire(new MeshClickEvent(this, {mesh: mesh}));
	}
}
