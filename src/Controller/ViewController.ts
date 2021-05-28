import Controller from "@/Controller";
import {ViewClickEvent} from "@/View";
import {ComponentEvents} from "@/Component";
import Log from "@/log";

const log = Log.instance("view-controller");

export { ViewClickEvent };
export class ViewControllerEvents extends ComponentEvents {
	click = this.$event(ViewClickEvent);
}

export default class ViewController extends Controller {
	events!:ViewControllerEvents;

	onSetupEventsAndActions() {
		super.onSetupEventsAndActions();
		this.events = new ViewControllerEvents();
	}

	click(event:ViewClickEvent) {
		log.info(`${this} clicked.`);
		this.onClick(event);
		this.events.click.fire(event);
	}
	onClick(event:ViewClickEvent): void {
		// For override
	}
}
