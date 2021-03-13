import * as _ from "lodash";
import {Alphanumeric, Class, Constructor, isAlphanumeric, isClass} from "validation-kit";

import Log from "log-control";

const log = Log.instance("event");

export type TypeClass<T> = Constructor<T>|String|Number|Boolean|Alphanumeric;

export type callback<T> = (payload:T)=>void
export default class EventInterface<T> {
	private listeners:callback<T>[] = [];
	private readonly type?:TypeClass<T>;

	constructor(runtimeType?:TypeClass<T>) {
		this.type = runtimeType;
	}

	on(listener:callback<T>) {
		this.listeners.push(listener);
	}

	off(listener:callback<T>) {
		this.listeners.splice(this.listeners.indexOf(listener),1);
	}

	fire(event:T) {
		if(this.type) {
			if(!this.isCorrectType(event)) {
				const message = `Incompatible payload for event '${this.constructor.name}'.`;
				log.error(message, event);
				throw new Error(message);
			}
		}
		this.listeners.forEach(listener => {
			listener(event);
		});
	}

	private isCorrectType(value:unknown) {
		switch(this.type) {
			case undefined: return true;
			case String: return _.isString(value);
			case Number: return _.isNumber(value);
			case Boolean: return _.isBoolean(value);
			case Alphanumeric: return isAlphanumeric(value);
			default: {
				if(isClass(this.type)) {
					return value instanceof this.type;
				}
				// Should not happen.
				throw new Error("Cannot handle type.");
			}
		}
	}
}

export class Events {
	private readonly $allowDynamicEvents:boolean;
	private readonly $byName:Record<string,EventInterface<unknown>> = {};

	constructor(allowDynamicEvents:boolean = false) {
		this.$allowDynamicEvents = allowDynamicEvents;
	}

	$event<T>(EventClass:Constructor<T>, name?:string):EventInterface<T> {
		if(!name) {
			name = EventClass.name;
		}
		const event = new EventInterface<T>(EventClass);
		this.$byName[name] = <EventInterface<unknown>>event;
		return event;
	}

	/**
	 * Listen to event based on a runtime-defined string.
	 * If `allowDynamicEvents` is `true`, the event can be listened to even if it does not exist yet.
	 * @param {string} event
	 * @param {callback} callback
	 */
	$on(event:string|Class, callback:callback<unknown>) {
		event = this.$getEvent(event);
		const property = this.$get(event);
		property.on(callback);
	}

	/**
	 * Stop listening to event based on a runtime-defined string.
	 * @param event
	 * @param callback
	 */
	$off(event:string|Class, callback:callback<unknown>) {
		event = this.$getEvent(event);
		let property = _.get(this, event);
		if(!(property instanceof EventInterface)) {
			return; // nothing to do here
		}
	}

	/**
	 * Fire event based on a runtime-defined string.
	 * @param event
	 * @param payload
	 */
	$fire(event:string|Class, payload?:unknown) {
		event = this.$getEvent(event);
		let property = _.get(this, event);
		if(!(property instanceof EventInterface)) {
			return; // nothing to do here
		}
		property.fire(payload);
	}

	/**
	 * Gets an event based on a runtime-defined string.
	 * If the event is not predefined, and the Events instance allows dynamic events, it will create the event.
	 * @param event
	 */
	$get(event:string|Class):EventInterface<unknown> {
		event = this.$getEvent(event);
		if(!(event in this.$byName) && this.$allowDynamicEvents) {
			// Define event on the fly
			this.$byName[event] = new EventInterface<unknown>();
		} else {
			throw new Error(`Unknown event '${event}'.`);
		}

		return this.$byName[event];
	}

	private $getEvent(event:string|Class) {
		if(isClass(event)) return event.name;
		return event;
	}
}
