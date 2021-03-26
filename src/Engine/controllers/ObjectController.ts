import {controllers, injectable} from "@/Controller";
import ControllerModel from "@/ControllerModel";
import Log from "@/log";
import ObjectModel from "@/Engine/models/ObjectModel";
import Vector3Model from "@/Engine/models/Vector3Model";
import IRootObjectView, {ObjectClickEvent} from "@/Engine/views/common/IObjectView/IRootObjectView";
import Vector3 from "@/Engine/views/common/Vector3";
import TriggerController from "@/Engine/controllers/TriggerController";
import {check, instanceOf} from "validation-kit";
import {isNumber} from "lodash";
import IView from "@/Engine/views/common/IObjectView";
import BehaviourController from "@/Engine/controllers/BehaviourController";
import ControllerList from "@/Controller/ControllerList";
import {schema} from "mozel";
import XRController from "@/Engine/XRController";

const log = Log.instance("Engine/Object");

@injectable()
export default class ObjectController extends XRController {
	static ModelClass = ObjectModel;
	model!:ObjectModel;

	log = log;

	private _root!:IRootObjectView;
	get root(){ return this._root; };

	@controllers(schema(ObjectModel).behaviours, BehaviourController)
	behaviours!:ControllerList<BehaviourController>;

	@controllers(schema(ObjectModel).triggers, TriggerController)
	triggers!:ControllerList<TriggerController>;

	init(xrObject:ControllerModel) {
		super.init(xrObject);

		this.triggers.events.added.on(event => event.controller.setDefaultController(this));
		this.triggers.events.removed.on(event => event.controller.setDefaultController(undefined));

		this._root = this.viewFactory.create<IRootObjectView>("IRootObjectView");
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
		const xrObject = await this.createObjectView();
		this.root.add(xrObject);
	}

	/**
	 * For override
	 * Creates a ThreeObject3D from the Object.
	 */
	async createObjectView():Promise<IView> {
		return this.viewFactory.create<IView>("IRootObjectView");
	}
}
