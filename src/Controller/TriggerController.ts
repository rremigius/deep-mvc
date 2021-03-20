import Controller, {ControllerAction, ControllerEvent, injectable} from "@/Controller";
import Log from "@/log";
import TriggerModel from "@/models/TriggerModel";
import {forEach, isEmpty, isPlainObject, isString} from 'lodash';
import ControllerSlot from "@/Controller/ControllerSlot";
import {isSubClass} from "validation-kit";

const log = Log.instance("controller/trigger");

type UnknownTrigger = TriggerModel<ControllerEvent<object>,ControllerAction<object>>;

@injectable()
export default class TriggerController extends Controller {
	static ModelClass = TriggerModel;

	private defaultController?:Controller;
	model!:TriggerModel<any,any>; // TS: initialized in super constructor

	source!:ControllerSlot<Controller>;
	target!:ControllerSlot<Controller>;

	get triggerModel() {
		return <UnknownTrigger>this.model;
	}

	init(xrTrigger:UnknownTrigger) {
		super.init(xrTrigger);

		this.source = this.controller(this.model.event.$('source'), Controller);
		this.source.init(()=>this.restartListening());

		this.target = this.controller(this.model.action.$('target'), Controller);

		this.triggerModel.$watch({
			path: 'event.name',
			immediate: true,
			handler: ()=> {
				this.restartListening();
			}
		});
	}

	/**
	 * Start listening to a new source.
	 */
	restartListening() {
		if (this._started) {
			this.stopListening();
			this.startListening();
		}
	}

	startListening() {
		const source = this.getSource();
		const events = source ? source.events : this.eventBus;
		const eventName = this.triggerModel.event.name;
		const callback = this.onEvent.bind(this);

		this.listenToEventName(events, eventName, callback);
	}

	setDefaultController(controller?:Controller) {
		this.defaultController = controller;
	}

	getEvent() {
		return this.triggerModel.event.name;
	}
	getSource() {
		return this.source.get() || this.defaultController;
	}
	getTarget() {
		return this.target.get() || this.defaultController;
	}
	getAction() {
		return this.triggerModel.action.name;
	}

	onEvent(event:unknown) {
		if(!(event instanceof ControllerEvent)) {
			throw this.error("Cannot handle non-ControllerEvents", event);
		}
		const data = event.data;
		if(this.triggerModel.condition && !this.triggerModel.condition.eval(data)) {
			log.log("Condition for trigger not met; not calling target action.");
			return;
		}
		this.targetAction(data);
	}

	onEnable() {
		super.onEnable();
		this.startListening();
	}

	onDisable() {
		super.onDisable();
		this.stopListening();
	}

	private targetAction(payload:unknown) {
		if(payload !== undefined && !isPlainObject(payload)) {
			log.error("Action payload should be a plain object.");
			return;
		}
		const target = this.getTarget();
		if(!target) {
			log.error(`No target for action '${this.triggerModel.action.name}'.`);
			return;
		}

		let input:Record<string, unknown>|undefined = undefined;
		let mapping = this.triggerModel.mapping.exportGeneric();
		if(isPlainObject(payload)) {
			input = <Record<string, unknown>>payload;
			if(!isEmpty(mapping)) {
				// Map data from source to target
				forEach(mapping, (from:any, to:string) => {
					if(!isString(from)) {
						log.error("Cannot map from non-string.", from);
						return;
					}
					input![to] = (<any>payload)[from];
				});
			}
		}

		let action;
		try {
			action = target.actions.$get(this.triggerModel.action.name);
		} catch(e) {
			throw new Error(`Unknown action '${this.triggerModel.action.name}' on ${target.static.name}.`);
		}
		if(!isSubClass(action.type, ControllerAction)) {
			throw new Error("Trigger action is not a ControllerAction.");
		}
		const Action = action.type;
		target.actions.$fire(this.triggerModel.action.name, new Action(input));
	}
}
