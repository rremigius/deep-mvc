import Controller, {injectable} from "@/Controller";
import ControllerModel from "@/models/ControllerModel";
import Log from "@/log";
import ObjectModel from "@/models/ObjectModel";
import BehaviourController from "./BehaviourController";
import Vector3Model from "@/models/Vector3Model";
import RootObjectRenderInterface, {ObjectClickEvent} from "@/renderers/common/ObjectRenderInterface/RootObjectRenderInterface";
import Vector3 from "@/renderers/common/Vector3";
import TriggerController from "@/Controller/TriggerController";
import ControllerList from "@/Controller/ControllerList";
import {check, instanceOf} from "validation-kit";
import {isNumber} from "lodash";
import ObjectRenderInterface from "@/renderers/common/ObjectRenderInterface";

const log = Log.instance("Engine/Object");

@injectable()
export default class ObjectController extends Controller {
	static ModelClass = ObjectModel;

	behaviours:ControllerList<BehaviourController> = this.createControllerList(this.xrObject.behaviours, BehaviourController);
	triggers!:ControllerList<TriggerController>;

	log = log;

	private _root!:RootObjectRenderInterface;
	get root(){ return this._root; };

	init(xrObject:ControllerModel) {
		super.init(xrObject);

		this._root = this.renderFactory.create<RootObjectRenderInterface>("RootObjectRenderInterface");
		this._root.gid = xrObject.gid;
		this._root.events.click.on(event => this.onClick(event));

		// Watch the model for changes
		this.xrObject.$watch({
			path: 'position',
			deep: true,
			immediate: true,
			handler: position => {
				const $position = check<Vector3Model>(position, instanceOf(Vector3Model), 'position');
				this.onPositionChanged($position);
			}
		});
		this.xrObject.$watch({
			path: 'scale',
			deep: true,
			immediate: true,
			handler: scale => {
				const $scale = check<number>(scale, isNumber, 'scale');
				this.onScaleChanged($scale);
			}
		});

		this.triggers = this.createControllerList(this.xrObject.triggers, TriggerController);
		this.triggers.each(trigger => trigger.setDefaultController(this));
	}

	// For override
	onClick(event:ObjectClickEvent): void {

	}

	get xrObject() {
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
