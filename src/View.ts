import Component, {ComponentConstructor, ComponentEvent, ComponentEvents, components} from "./Component";
import {Registry, schema} from "mozel";
import ViewFactory from "./View/ViewFactory";
import Controller from "@/Controller";
import ViewModel from "@/View/ViewModel";
import ComponentList from "@/Component/ComponentList";
import Log from "@/log";
import ViewController from "@/Controller/ViewController";

const log = Log.instance("view");

export class ViewClickEvent extends ComponentEvent<{}>{}
export class ViewEvents extends ComponentEvents {
	click = this.$event(ViewClickEvent);
}

export default class View extends Component {
	static Model = ViewModel;
	model!:ViewModel;

	@components(schema(ViewModel).children, View)
	children!:ComponentList<View>;

	controller?:ViewController;
	controllerRegistry?:Registry<Controller>;
	factory!:ViewFactory; // TS: set on Component constructor

	events = new ViewEvents();

	onInit() {
		super.onInit();

		this.children.events.added.on(event => {
			this.addView(event.component);
		});
		this.children.events.removed.on(event => {
			this.removeView(event.component);
		})
	}

	findController<C extends Component>(ExpectedClass:ComponentConstructor<C>) {
		if(!this.factory.controllerRegistry) return;

		const component = this.factory.controllerRegistry.byGid(this.model.gid);
		if(component && !(component instanceof ExpectedClass)) {
			throw new Error(`View '${this.static.name}' expected component of type '${ExpectedClass.name}', found '${component.static.name}' instead.`);
		}
		return component;
	}

	requireController<C extends Component>(ExpectedClass:ComponentConstructor<C>) {
		const component = this.findController(ExpectedClass);
		if(!component) {
			throw new Error(`No Controller found for View '${this.static.name} (GID ${this.model.gid}).`);
		}
		return component;
	}

	click() {
		log.info(`${this} clicked.`);
		const event = new ViewClickEvent(this, {});
		this.onClick(event);
		this.events.click.fire(new ViewClickEvent(this, {}));
		if(this.controller) {
			this.controller.click(event);
		}
	}
	addView(view:View) {
		this.onViewAdd(view);
	}
	removeView(view:View) {
		this.onViewRemove(view);
	}
	onClick(event:ViewClickEvent) {
		// For override
	}
	onViewAdd(view:View) {
		// For override
	}
	onViewRemove(view:View) {
		// For override
	}
}
