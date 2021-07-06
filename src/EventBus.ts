import {Events} from "./EventEmitter";

export default class EventBus extends Events {
	constructor() {
		super(true);
	}
}
