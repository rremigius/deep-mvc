import Controller from "@/Controller";
import {ViewClickEvent, ViewEvents} from "@/View";
import {ComponentEvents} from "@/Component";

export { ViewClickEvent };
export class ViewControllerEvents extends ComponentEvents {
	click = this.$event(ViewClickEvent);
}

export default class ViewController extends Controller {
	events = new ViewEvents();

	click(event:ViewClickEvent) {
		this.onClick(event);
		this.events.click.fire(event);
	}
	onClick(event:ViewClickEvent): void {
		// For override
	}
}
