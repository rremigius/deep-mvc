import Controller from "@/Controller";
import Mozel from "mozel";
import ControllerFactory from "@/Controller/ControllerFactory";
import {get, set} from 'lodash';
import Log from "@/log";
import EventInterface, {Event} from "event-interface-mixin";

const log = Log.instance("engine/controller/sync");

export class ControllerChangeEvent extends Event<{controller?:Controller, old?:Controller}> {}

export default class ModelControllerSync<T extends Controller> {
	parent?:Controller;
	controller?:T;

	watchModel:Mozel;
	path:string;
	ControllerClass:typeof Controller;
	factory:ControllerFactory;
	private readonly allowControllerCreation:boolean;

	watching:boolean = false;

	private eventInterface:EventInterface = new EventInterface();
	on = this.eventInterface.getOnMethod();
	off = this.eventInterface.getOffMethod();
	private fire = this.eventInterface.getFireMethod();

	constructor(parentController:Controller, watchModel:Mozel, path:string, ControllerClass:typeof Controller, factory:ControllerFactory, forChildController:boolean = false) {
		this.parent = parentController;
		this.watchModel = watchModel;
		this.path = path;
		this.ControllerClass = ControllerClass;
		this.factory = factory;
		this.allowControllerCreation = forChildController;
	}

	isT(controller:any): controller is T {
		return controller instanceof this.ControllerClass;
	}

	isForChildController() {
		return this.allowControllerCreation;
	}

	startWatching() {
		if(this.watching) {
			log.warn("Already watching. Not starting again.");
			return;
		}
		this.watching = true;
		this.watchModel.$watch({
			path: this.path,
			immediate: true,
			handler: () => {
				// Will be checked by the setter defined in `setupModelReference`
				this.set(this.syncFromModel());
			}
		});
	}

	syncFromModel() {
		const model = get(this.watchModel, this.path);
		if(!model) return;

		let controller = this.factory.registry.byGid(model.gid);

		// If it's for a child controller, we are responsible for creating it if it doesn't exist.
		if(!controller && this.allowControllerCreation) {
			controller = this.factory.create(this.ControllerClass, model, true);
		}
		if(controller && !this.isT(controller)) {
			log.error(`Controller with GID ${model.gid} was not an instance of ${this.ControllerClass.name}.`);
			return;
		}
		return controller;
	}

	syncToModel() {
		set(this.watchModel, this.path, this.controller && this.controller.model);
	}

	set(controller?:T) {
		const oldController = this.controller;
		this.controller = controller;
		this.syncToModel();

		// TS: ControllerChangeEvent uses controller, here we fire event with T extends Controller
		this.fire(ControllerChangeEvent as any, {controller: controller, old: oldController});
	}

	get() {
		return this.controller;
	}
}
