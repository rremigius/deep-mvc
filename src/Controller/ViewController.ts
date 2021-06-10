import Controller from "@/Controller";
import {ViewClickEvent} from "@/View";
import {ComponentEvent, ComponentEvents} from "@/Component";
import Log from "@/log";

const log = Log.instance("view-controller");

export { ViewClickEvent };
export class SelectEvent extends ComponentEvent<{}>{}
export class DeselectEvent extends ComponentEvent<{}>{}
export class ViewControllerEvents extends ComponentEvents {
	click = this.$event(ViewClickEvent);
	select = this.$event(SelectEvent);
	deselect = this.$event(DeselectEvent);
}

export default class ViewController extends Controller {
	static Events = ViewControllerEvents;
	events!:ViewControllerEvents;

	/* State */
	protected selectable:boolean = true;

	click(event:ViewClickEvent) {
		log.info(`${this} clicked.`);
		this.onClick(event);
		this.events.click.fire(event);
	}
	onClick(event:ViewClickEvent): void { }
}
