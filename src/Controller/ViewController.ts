import Controller from "@/Controller";
import {ViewClickEvent} from "@/View";
import {ComponentEvent, ComponentEvents} from "@/Component";
import Log from "@/log";
import ViewModel from "@/ViewModel";
import {schema} from "mozel";

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
	static Model = ViewModel;
	model!:ViewModel;

	events!:ViewControllerEvents;

	/* State */
	protected selectable:boolean = true;

	onInit() {
		super.onInit();
		this.watch(schema(ViewModel).selected, selected => {
			if(selected) {
				this.onSelected();
			} else {
				this.onDeselected();
			}
		});
	}

	onSetupEventsAndActions() {
		super.onSetupEventsAndActions();
		this.events = new ViewControllerEvents();
	}

	select(state:boolean = true) {
		this.model.selected = state;
	}

	click(event:ViewClickEvent) {
		log.info(`${this} clicked.`);
		this.onClick(event);
		this.events.click.fire(event);

		if(this.selectable) {
			this.select();
		}
	}
	onClick(event:ViewClickEvent): void {
		// For override
	}
	onSelected() {
		log.info(`${this} selected.`);
		this.events.select.fire(new SelectEvent(this));
		this.eventBus.$fire(new SelectEvent(this));
	}
	onDeselected() {
		log.info(`${this} deselected.`);
		this.events.select.fire(new DeselectEvent(this));
		this.eventBus.$fire(new SelectEvent(this));
	}
}
