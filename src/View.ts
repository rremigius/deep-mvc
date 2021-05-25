import Component, {ComponentConstructor, ComponentEvent, ComponentEvents, components} from "./Component";
import {Registry, schema} from "mozel";
import ViewFactory from "./View/ViewFactory";
import Vector3, {SparseVector3} from "@/Engine/views/common/Vector3";
import Controller from "@/Controller";
import ViewModel from "@/ViewModel";
import ComponentList from "@/Component/ComponentList";

export class ViewClickEvent extends ComponentEvent<{}>{}
export class ViewEvents extends ComponentEvents {
	click = this.$event(ViewClickEvent);
}

export default class View extends Component {
	static Model = ViewModel;
	model!:ViewModel;

	@components(schema(ViewModel).children, View)
	children!:ComponentList<View>;

	controllerRegistry?:Registry<Controller>;
	factory!:ViewFactory; // TS: set on Component constructor

	events = new ViewEvents();

	init(model:ViewModel) {
		super.init(model);

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
			throw new Error(`View '${this.static.name}' expected component of type '${component.static.name}', found '${component.static.name} instead.`);
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
		const event = new ViewClickEvent(this, {});
		this.onClick(event);
		this.events.click.fire(new ViewClickEvent(this, {}));
	}
	addView(view:View) {
		this.onViewAdd(view);
	}
	removeView(view:View) {
		this.onViewRemove(view);
	}
	setPosition(position:Vector3|SparseVector3) {
		this.onSetPosition(position);
	}
	setScale(scale:number) {
		this.onSetScale(scale);
	}
	setVisible(visible:boolean) {
		this.onSetVisible(visible);
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
	onSetPosition(position:Vector3|SparseVector3) {
		// For override
	}
	onSetScale(scale:number) {
		// For override
	}
	onSetVisible(visible:boolean) {
		// For override
	}
}
