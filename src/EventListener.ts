import EventInterface, {callback} from "@/EventInterface";

export default class EventListener<T> {
	private readonly event:EventInterface<T>
	private readonly callback:callback<T>;

	remove:boolean = false;

	constructor(event:EventInterface<T>, callback:callback<T>) {
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
