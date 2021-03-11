import Controller, {Action, injectableController} from "@/Controller";
import Log from "@/log";
import TriggerModel from "@/models/TriggerModel";
import {forEach, isEmpty, isPlainObject, isString} from 'lodash';
import ModelControllerSync from "@/Controller/ModelControllerSync";
import {Event} from "event-interface-mixin"

const log = Log.instance("Engine/Trigger");

type UnknownTrigger = TriggerModel<Event<unknown>,Action<unknown>>;

@injectableController()
export default class TriggerController extends Controller {
	static ModelClass = TriggerModel;

	private defaultController?:Controller;

	public source:ModelControllerSync<Controller> = this.createControllerSync('event.source', Controller);
	public target:ModelControllerSync<Controller> = this.createControllerSync('action.target', Controller);

	get triggerModel() {
		return <UnknownTrigger>this.model;
	}

	init(xrTrigger:UnknownTrigger) {
		super.init(xrTrigger);

		this.triggerModel.$watch({
			path: 'event.name',
			immediate: true,
			handler: ()=> {
				if (this._started) {
					this.stopListening();
					this.startListening();
				}
			}
		});
	}

	startListening() {
		const source = this.source.get() || this.eventBus;
		const eventName = this.triggerModel.event.name;
		const callback = this.onEvent.bind(this);

		this.listenTo(source, eventName, callback);
	}

	setDefaultController(controller:Controller) {
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

	onEvent(payload:unknown) {
		if(this.triggerModel.condition && !this.triggerModel.condition.eval(payload)) {
			log.log("Condition for trigger not met; not calling target action.");
			return;
		}
		this.targetAction(payload);
	}

	onEnable() {
		super.onEnable();
		this.startListening();
	}

	onDisable() {
		super.onDisable();
		this.stopListening();
	}

	targetAction(payload:unknown) {
		if(!isPlainObject(payload) && payload !== undefined) {
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

		target.callAction(this.triggerModel.action.name, input);
	}
}
