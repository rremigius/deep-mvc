import Component, {ComponentConstructor, ComponentEvent, ComponentEvents} from "./Component";
import {Registry} from "mozel";
import ViewFactory from "./View/ViewFactory";
import Vector3, {SparseVector3} from "@/Engine/views/common/Vector3";

export class ViewClickEvent extends ComponentEvent<{intersects:object[]}>{}
export class ViewEvents extends ComponentEvents {
	click = this.$event(ViewClickEvent);
}

export default class View extends Component {
	componentRegistry?:Registry<Component>;
	factory!:ViewFactory; // TS: set on Component constructor

	events = new ViewEvents();

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
			throw new Error(`No component found for View '${this.static.name} (GID ${this.model.gid}).`);
		}
		return component;
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
	onSetScale(scale:Vector3|SparseVector3) {
		// For override
	}
	onSetVisible(visible:boolean) {
		// For override
	}
}
