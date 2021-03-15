import ObjectController from "@/Controller/ObjectController";
import {ControllerEvent, ControllerEvents, injectable} from "@/Controller";
import Model3DModel from "@/models/Object3DModel/Model3DModel";
import Log from "@/log";
import ObjectRenderInterface from "@/renderers/common/ObjectRenderInterface";
import Model3DRenderInterface from "@/renderers/common/ObjectRenderInterface/Model3DRenderInterface";
import {ObjectClickEvent} from "@/renderers/common/ObjectRenderInterface/RootObjectRenderInterface";
import {Object3D} from "three";
import {check, instanceOf} from "validation-kit";

const log = Log.instance("Controller/Object/Object3D");

export class ClickEvent extends ControllerEvent<{mesh:string}> {}
export class Model3DControllerEvents extends ControllerEvents {
	click = this.$event(ClickEvent);
}

@injectable()
export default class Model3DController extends ObjectController {
	static ModelClass = Model3DModel;
	private modelRender: Model3DRenderInterface = this.renderFactory.create<Model3DRenderInterface>("Model3DRenderInterface");

	log = log;
	events = new Model3DControllerEvents();

	init(xrObject:Model3DModel) {
		super.init(xrObject);
	}

	onClick(event:ObjectClickEvent): void {
		super.onClick(event);

		const meshNames = event.intersects.map(mesh => {
			const $object3D = check<Object3D>(mesh, instanceOf(Object3D), "mesh");
			return $object3D.name;
		});
		const foundClickableMesh = meshNames.find(name =>
			this.xrModel3D.clickableMeshes.find(name) !== undefined
		);
		if (foundClickableMesh) {
			this.events.click.fire(new ClickEvent(this, { mesh: foundClickableMesh } ));
		}
	}

	get xrModel3D() {
		return <Model3DModel>this.model;
	}

	async createObjectRender():Promise<ObjectRenderInterface> {
		return this.modelRender.load(this.xrModel3D);
	}
}
