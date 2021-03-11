import ObjectController from "@/Controller/ObjectController";
import {injectableController} from "@/Controller/controller";
import Model3DModel from "@/models/Object3DModel/Model3DModel";
import Log from "@/log";
import ObjectRenderInterface from "@/renderers/common/ObjectRenderInterface";
import Model3DRenderInterface from "@/renderers/common/ObjectRenderInterface/Model3DRenderInterface";
import {EventBase} from "@/Events";
import {ClickEventInterface} from "@/renderers/common/ObjectRenderInterface/ControllerRootRenderInterface";

const log = Log.instance("Controller/Object/Object3D");

export class ClickEvent extends EventBase<{mesh:string}> {}

@injectableController()
export default class Model3DController extends ObjectController {
	static ModelClass = Model3DModel;
	private modelRender: Model3DRenderInterface<unknown> = this.renderFactory.create<Model3DRenderInterface<unknown>>("Model3DRenderInterface");

	init(xrObject:Model3DModel) {
		super.init(xrObject);
	}

	handleClick(event: ClickEventInterface): void {
		super.handleClick(event);

		const meshes: string[] = event.meshes;
		const foundClickableMesh = meshes.find((mesh) =>
			this.xrModel3D.clickableMeshes.find(mesh) !== undefined
		);
		if (foundClickableMesh) {
			this.fireEvent<ClickEvent>(ClickEvent.name, { mesh: foundClickableMesh } );
		}
	}

	get xrModel3D() {
		return <Model3DModel>this.model;
	}

	async createObjectRender():Promise<ObjectRenderInterface<unknown>> {
		return this.modelRender.load(this.xrModel3D);
	}
}
