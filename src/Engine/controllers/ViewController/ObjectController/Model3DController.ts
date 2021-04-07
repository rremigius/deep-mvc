import ObjectController from "@/Engine/controllers/ViewController/ObjectController";
import {ControllerEvent, ControllerEvents} from "@/Controller";
import Model3DModel from "@/Engine/models/ObjectModel/Model3DModel";
import Log from "@/log";
import IModel3DView, {IModel3DViewSymbol} from "@/Engine/views/common/IObjectView/IModel3DView";
import {Object3D} from "three";
import {check, instanceOf} from "validation-kit";
import {ViewClickEvent} from "@/IViewRoot";

const log = Log.instance("Controller/Object/Object3D");

export class ClickEvent extends ControllerEvent<{mesh:string}> {}
export class Model3DControllerEvents extends ControllerEvents {
	click = this.$event(ClickEvent);
}

export default class Model3DController extends ObjectController {
	static ModelClass = Model3DModel;
	static ViewInterface = IModel3DViewSymbol;

	model!:Model3DModel;
	get view(): IModel3DView { return super.view as IModel3DView }

	log = log;
	events = new Model3DControllerEvents();

	onClick(event:ViewClickEvent): void {
		super.onClick(event);

		const meshNames = event.intersects.map(mesh => {
			const $object3D = check<Object3D>(mesh, instanceOf(Object3D), "mesh");
			return $object3D.name;
		});
		const foundClickableMesh = meshNames.find(name =>
			this.model.clickableMeshes.find(name) !== undefined
		);
		if (foundClickableMesh) {
			this.events.click.fire(new ClickEvent(this, { mesh: foundClickableMesh } ));
		}
	}

	async onLoad() {
		await this.view.load(this.model);
	}
}
