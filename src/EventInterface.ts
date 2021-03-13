import * as _ from "lodash";
import {Alphanumeric, Class, Constructor, isAlphanumeric, isClass} from "validation-kit";

import Log from "log-control";

const log = Log.instance("event");

export type TypeClass<T> = Constructor<T>|String|Number|Boolean|Alphanumeric;

function getTypeName(type:unknown) {
	const className = _.get(type, 'constructor.name');
	if(className) return className;
	return typeof(type);
}

export type callback<T> = (payload:T)=>void
export default class EventInterface<T> {
	private listeners:callback<T>[] = [];

	type?:TypeClass<T>;

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
				const message = `Incompatible payload. Expected '${_.get(this.type, 'name')}', received '${getTypeName(event)}'.`;
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

	/**
	 * Creates an EventInterface and registers it.
	 * @param EventClass
	 * @param name
	 */
	$event<T>(EventClass:Constructor<T>, name?:string):EventInterface<T> {
		if(!name) {
			name = EventClass.name;
		}
		const event = new EventInterface<T>(EventClass);
		return this.$register(event, name);
	}

	/**
	 * Registers an EventInterface so it can be called by name.
	 * @param event
	 * @param name
	 */
	$register<T>(event:EventInterface<T>, name:string):EventInterface<T> {
		// Register new
		if(!(name in this.$byName)) {
			this.$byName[name] = <EventInterface<unknown>>event;
			return event;
		}
		// Update existing
		const existing = this.$byName[name];
		if(!existing.type && event.type) {
			existing.type = event.type;
		}
		return event;
	}

	/**
	 * Listen to event based on a runtime-defined string.
	 * If `allowDynamicEvents` is `true`, the event can be listened to even if it does not exist yet.
	 * @param {string} event
	 * @param {callback} callback
	 */
	$on(event:string|Class, callback:callback<unknown>) {
		const eventInterface = this.$get(event);
		eventInterface.on(callback);
	}

	/**
	 * Stop listening to event based on a runtime-defined string.
	 * @param event
	 * @param callback
	 */
	$off(event:string|Class, callback:callback<unknown>) {
		const eventInterface = this.$get(event);
		eventInterface.off(callback);
	}

	/**
	 * Fire event based on a runtime-defined string.
	 * @param event
	 * @param payload
	 */
	$fire(event:string|Class, payload?:unknown) {
		const eventInterface = this.$get(event);
		eventInterface.fire(payload);
	}

	/**
	 * Gets an event based on a runtime-defined string.
	 * If the event is not predefined, and the Events instance allows dynamic events, it will create the event.
	 * @param event
	 */
	$get(event:string|Class):EventInterface<unknown> {
		event = this.$getEventName(event);
		if(!(event in this.$byName)) {
			if (!this.$allowDynamicEvents) {
				throw new Error(`Unknown event '${event}'.`);
			}
			// Define event on the fly
			this.$byName[event] = new EventInterface<unknown>();
		}

		return this.$byName[event];
	}

	private $getEventName(event:string|Class) {
		if(isClass(event)) return event.name;
		return event;
	}
}
