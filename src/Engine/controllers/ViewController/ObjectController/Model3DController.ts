import ObjectController from "@/Engine/controllers/ViewController/ObjectController";
import Model3DModel from "@/Engine/models/ObjectModel/Model3DModel";
import {Object3D} from "three";
import {check, instanceOf} from "validation-kit";
import {ViewClickEvent} from "@/View";
import {ComponentEvent} from "@/Component";
import {ViewControllerEvents} from "@/Controller/ViewController";

export class ClickEvent extends ComponentEvent<{mesh:string}> {}
export class Model3DControllerEvents extends ViewControllerEvents {
	meshClick = this.$event(ClickEvent);
}

export default class Model3DController extends ObjectController {
	static ModelClass = Model3DModel;
	model!:Model3DModel;

	events = new Model3DControllerEvents();

	onClick(event:ViewClickEvent): void {
		super.onClick(event);

		const meshNames = event.data.intersects.map(mesh => {
			const $object3D = check<Object3D>(mesh, instanceOf(Object3D), "mesh");
			return $object3D.name;
		});
		const foundClickableMesh = meshNames.find(name =>
			this.model.clickableMeshes.find(name) !== undefined
		);
		if (foundClickableMesh) {
			this.events.meshClick.fire(new ClickEvent(this, { mesh: foundClickableMesh } ));
		}
	}
}
