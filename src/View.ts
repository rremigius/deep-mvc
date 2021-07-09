import Component, {ComponentConstructor, ComponentEvent, ComponentEvents} from "./Component";
import {Registry} from "mozel";
import ViewFactory from "./View/ViewFactory";
import Log from "./log";

const log = Log.instance("view");

export class ViewClickEvent extends ComponentEvent<{position:{x:number, y:number}}>{}
export class ViewRightClickEvent extends ComponentEvent<{position:{x:number, y:number}}>{}
export class ViewEvents extends ComponentEvents {
	click = this.$event(ViewClickEvent);
	rightClick = this.$event(ViewRightClickEvent);
}
export const ControllerRegistrySymbol = Symbol.for("ControllerRegistrySymbol");

export default class View extends Component {
	static Events = ViewEvents;
	declare events:ViewEvents;

	_container?:HTMLElement;
	get container() {
		return this._container;
	}

	controller?:Component;
	controllerRegistry?:Registry<Component>;
	factory!:ViewFactory; // TS: set on Component constructor

	onInit() {
		if(this.dependencies.isBound(ControllerRegistrySymbol)) {
			this.controllerRegistry = this.dependencies.get(ControllerRegistrySymbol);
		}
		super.onInit();
	}

	findController<C extends Component>(ExpectedClass:ComponentConstructor<C>) {
		if(!this.controllerRegistry) return;

		const component = this.controllerRegistry.byGid(this.model.gid);
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

	click(details:{position:{x:number, y:number}}) {
		log.info(`${this} clicked.`);
		const event = new ViewClickEvent(this, details);
		this.onClick(event);
		this.events.click.fire(new ViewClickEvent(this));
	}

	rightClick(details:{position:{x:number, y:number}}) {
		log.info(`${this} right-clicked.`);
		const event = new ViewRightClickEvent(this, details);
		this.onRightClick(event);
		this.events.rightClick.fire(event);
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
	onRightClick(event:ViewRightClickEvent):void {}
}
