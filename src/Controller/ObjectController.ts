import Controller, {controllers, injectable} from "@/Controller";
import ControllerModel from "@/models/ControllerModel";
import Log from "@/log";
import ObjectModel from "@/models/ObjectModel";
import Vector3Model from "@/models/Vector3Model";
import RootObjectRenderInterface, {ObjectClickEvent} from "@/renderers/common/ObjectRenderInterface/RootObjectRenderInterface";
import Vector3 from "@/renderers/common/Vector3";
import TriggerController from "@/Controller/TriggerController";
import {check, instanceOf} from "validation-kit";
import {isNumber} from "lodash";
import ObjectRenderInterface from "@/renderers/common/ObjectRenderInterface";
import BehaviourController from "@/Controller/BehaviourController";
import ControllerList from "@/Controller/ControllerList";
import {schema} from "mozel";

const log = Log.instance("Engine/Object");

@injectable()
export default class ObjectController extends Controller {
	static ModelClass = ObjectModel;
	model!:ObjectModel;

	log = log;

	private _root!:RootObjectRenderInterface;
	get root(){ return this._root; };

	@controllers(schema(ObjectModel).behaviours, BehaviourController)
	behaviours!:ControllerList<BehaviourController>;

	@controllers(schema(ObjectModel).triggers, TriggerController)
	triggers!:ControllerList<TriggerController>;

	init(xrObject:ControllerModel) {
		super.init(xrObject);

		this.triggers.events.added.on(event => event.controller.setDefaultController(this));
		this.triggers.events.removed.on(event => event.controller.setDefaultController(undefined));

		this._root = this.renderFactory.create<RootObjectRenderInterface>("RootObjectRenderInterface");
		this._root.gid = xrObject.gid;
		this._root.events.click.on(event => this.onClick(event));

		// Watch the model for changes
		this.object.$watch({
			path: 'position',
			deep: true,
			immediate: true,
			handler: position => {
				const $position = check<Vector3Model>(position, instanceOf(Vector3Model), 'position');
				this.onPositionChanged($position);
			}
		});
		this.object.$watch({
			path: 'scale',
			deep: true,
			immediate: true,
			handler: scale => {
				const $scale = check<number>(scale, isNumber, 'scale');
				this.onScaleChanged($scale);
			}
		});
	}

	// For override
	onClick(event:ObjectClickEvent): void {

	}

	get object() {
		return <ObjectModel>this.model;
	}

	onPositionChanged(newPosition:Vector3Model) {
		this.root.setPosition(new Vector3(newPosition.x, newPosition.y, newPosition.z));
	}

	onScaleChanged(newScale:number) {
		this.root.setScale(new Vector3(newScale, newScale, newScale));
	}

	async onLoad() {
		const xrObject = await this.createObjectRender();
		this.root.add(xrObject);
	}

	/**
	 * For override
	 * Creates a ThreeObject3D from the Object.
	 */
	async createObjectRender():Promise<ObjectRenderInterface> {
		return this.renderFactory.create<ObjectRenderInterface>("RootObjectRenderInterface");
	}
}
