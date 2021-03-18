import Controller from "@/Controller";
import {clone, isArray, isFunction, isMatch} from 'lodash';
import EventEmitter, {Events} from "@/EventEmitter";

export class ControllerAddedEvent<T extends Controller> {
	constructor(public controller: T) {}
}
export class ControllerRemovedEvent<T extends Controller> {
	constructor(public controller: T) {}
}

class ControllerListEvents<T extends Controller> extends Events {
	// Using $register for generic type definition on EventEmitter
	added = this.$register(new EventEmitter<ControllerAddedEvent<T>>(ControllerAddedEvent), ControllerAddedEvent.name);
	removed = this.$register(new EventEmitter<ControllerRemovedEvent<T>>(ControllerRemovedEvent), ControllerRemovedEvent.name);
}

export default class ControllerList<T extends Controller> {
	protected list:T[];

	events = new ControllerListEvents<T>();

	constructor(controllers?:T[]) {
		this.list = controllers ? clone(controllers) : [];
	}

	add(controller:T) {
		if(this.has(controller)) {
			// already in list, don't add again
			return;
		}
		this.list.push(controller);
		this.events.added.fire(new ControllerAddedEvent(controller));
	}

	has(controller:T) {
		return !!this.list.find(item => item === controller);
	}

	get(index:number) {
		return this.list[index];
	}

	remove(controller:T|T[]|((controller:T)=>boolean)):number {
		if(isArray(controller)) {
			return controller.reduce((sum:number, item:T) => this.remove(item), 0);
		}
		const check = isFunction(controller) ? controller : (item:Controller) => item === controller;
		let count = 0;
		for(let i = this.list.length-1; i >= 0; i--) {
			let item = this.list[i];
			if(check(item)) {
				this.list.splice(i, 1);
				this.events.removed.fire(new ControllerRemovedEvent(item));
			}
		}
		return count;
	}

	each(callback:(controller:T)=>void) {
		this.list.forEach(callback);
	}

	find(predicate:((value:T)=>boolean)|Record<string,unknown>) {
		const check = isFunction(predicate)
			? predicate
			: (candidate:T) => isMatch(candidate, predicate);

		for (const controller of this.list.values()) {
			if(check(controller)) {
				return controller;
			}
		}
	}

	destroy() {
		this.list.forEach(controller => controller.destroy());
	}
}
