import {EventInterfacer, Event, Callback, EventClass} from "event-interface-mixin";

export default class EventListener<E extends Event<T>, T> {
	private readonly eventInterfacer?:EventInterfacer;
	private readonly event?:EventClass<E,T>;
	private readonly callback:Callback<E>;

	remove:boolean = false;

	constructor(callback:Callback<E>, eventInterfacer?:EventInterfacer, event?:EventClass<E,T>) {
		this.callback = callback;
		this.eventInterfacer = eventInterfacer;
		this.event = event;
	}

	start() {
		if(this.eventInterfacer && this.event) {
			this.eventInterfacer.on(this.event, this.callback);
		}
	}

	stop() {
		if(this.eventInterfacer && this.event) {
			this.eventInterfacer.off(this.event, this.callback);
		}
	}
}
