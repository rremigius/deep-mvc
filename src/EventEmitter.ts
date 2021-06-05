import * as _ from "lodash";
import {Alphanumeric, Class, Constructor, isAlphanumeric, isClass} from "validation-kit";

import Log from "log-control";

const log = Log.instance("event-emitter");

export type TypeClass<T> = Constructor<T>|String|Number|Boolean|Alphanumeric;

function getTypeName(type:unknown) {
	const className = _.get(type, 'constructor.name');
	if(className) return className;
	return typeof(type);
}

export type Payload<T> = T extends Class ? T : never;
export type callback<T> = (payload:T)=>void
export default class EventEmitter<T> {
	private listeners:callback<T>[] = [];

	type?:TypeClass<T>;

	constructor(runtimeType?:TypeClass<T>) {
		this.type = runtimeType;
	}

	listenerCount() {
		return this.listeners.length;
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
	private readonly $byName:Record<string,EventEmitter<unknown>> = {};

	static getEventName(event:string|Function) {
		if(_.isFunction(event)) {
			return event.name;
		}
		return event as string;
	}

	constructor(allowDynamicEvents:boolean = false) {
		this.$allowDynamicEvents = allowDynamicEvents;
	}

	/**
	 * Creates an EventEmitter and registers it.
	 * @param EventClass
	 * @param name
	 */
	$event<T>(EventClass:Constructor<T>, name?:string):EventEmitter<T> {
		if(!name) {
			name = EventClass.name;
		}
		const event = new EventEmitter<T>(EventClass);
		return this.$register(event, name);
	}

	/**
	 * Registers an EventEmitter so it can be called by name.
	 * @param event
	 * @param name
	 */
	$register<T>(event:EventEmitter<T>, name:string):EventEmitter<T> {
		// Register new
		if(!(name in this.$byName)) {
			this.$byName[name] = <EventEmitter<unknown>>event;
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
	 * @param {string} EventClass
	 * @param {callback} callback
	 */
	$on<T>(EventClass:Constructor<T>, callback:callback<T>) {
		const eventEmitter = this.$get(EventClass);
		eventEmitter.on(event => {
			if(!(event instanceof EventClass)) {
				log.error(`Expected '${EventClass.name}', but got:`, event);
				throw new Error(`Expected '${EventClass.name}'.`);
			}
			callback(event);
		});
	}

	/**
	 * Stop listening to event based on a runtime-defined string.
	 * @param event
	 * @param callback
	 */
	$off(event:string|Class, callback:callback<unknown>) {
		const Ievent = this.$get(event);
		Ievent.off(callback);
	}

	/**
	 * Fire event based on a runtime-defined string.
	 * @param event
	 * @param payload
	 */
	$fire<T extends object>(event:string|T, payload?:unknown) {
		let eventEmitter:EventEmitter<any>;

		// Single-argument event firing
		if(_.isObject(event)) {
			eventEmitter = this.$get(event.constructor);
			eventEmitter.fire(event);
			return;
		}

		// Event name with payload
		eventEmitter = this.$get(event);
		eventEmitter.fire(payload);
	}

	/**
	 * Gets an event based on a runtime-defined string.
	 * If the event is not predefined, and the Events instance allows dynamic events, it will create the event.
	 * @param event
	 */
	$get(event:string|Function):EventEmitter<unknown> {
		event = Events.getEventName(event);
		if(!(event in this.$byName)) {
			if (!this.$allowDynamicEvents) {
				throw new Error(`Unknown event '${event}'.`);
			}
			// Define event on the fly
			this.$byName[event] = new EventEmitter();
		}

		return this.$byName[event];
	}
}
