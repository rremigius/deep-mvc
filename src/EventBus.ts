import {Events} from "@/EventInterface";

export default class EventBus extends Events {
	constructor() {
		super(true);
	}
}
