import EventEmitter, {callback} from "@/EventEmitter";

export default class EventListener<T> {
	private readonly event:EventEmitter<T>
	private readonly callback:callback<T>;

	remove:boolean = false;

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
