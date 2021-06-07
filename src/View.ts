import Component, {ComponentConstructor, ComponentEvent, ComponentEvents} from "./Component";
import {Registry} from "mozel";
import ViewFactory from "./View/ViewFactory";
import Controller from "@/Controller";
import ViewModel from "@/View/ViewModel";
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

	_container?:HTMLElement;
	get container() {
		return this._container;
	}

	events = new ViewEvents();

	controller?:ViewController;
	controllerRegistry?:Registry<Controller>;
	factory!:ViewFactory; // TS: set on Component constructor

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

	resize() {
		if(!this.container) return;
		this.onResize(this.container.clientWidth, this.container.clientHeight);
	}

	dismount() {
		if(!this._container) return;
		this.onDismount();
	}

	mount(container:HTMLElement) {
		if(container === this._container) return;
		this._container = container;
		this.onMount(container);
	}

	/* For override */
	onMount(container:HTMLElement):void {}
	onDismount():void {}
	onResize(width:number, height:number):void {}
	onClick(event:ViewClickEvent):void {}
	onViewAdd(view:View):void {}
	onViewRemove(view:View):void {}
}
