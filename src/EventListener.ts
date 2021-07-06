import EventEmitter, {callback} from "./EventEmitter";

/**
 * A class that can listen to an event, and can remove itself from the event when it stops listening.
 */
export default class EventListener<T> {
	private readonly event:EventEmitter<T>
	private readonly callback:callback<T>;

	constructor(event:EventEmitter<T>, callback:callback<T>) {
		this.event = event;
		this.callback = callback;
	}

	start() {
		this.event.on(this.callback);
	}

	stop() {
		this.event.off(this.callback);
	}
}
