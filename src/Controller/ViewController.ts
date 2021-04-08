import Controller, {controllers} from "@/Controller";
import IView, {IViewSymbol} from "@/IView";
import ControllerModel from "@/ControllerModel";
import IViewRoot, {ViewClickEvent} from "@/IViewRoot";
import Vector3Model from "@/Engine/models/Vector3Model";
import Vector3 from "@/Engine/views/common/Vector3";
import {check, instanceOf} from "validation-kit";
import {isNumber} from "lodash";
import ViewModel from "@/ViewModel";
import ControllerList from "@/Controller/ControllerList";
import {deep, immediate, schema} from "mozel";

export default class ViewController extends Controller {
	static readonly ModelClass = ViewModel;
	static readonly ViewInterface:symbol = IViewSymbol;

	model!:ViewModel;

	@controllers(schema(ViewModel).children, ViewController)
	views!:ControllerList<ViewController>; // cannot call it `children` due to conflict with Controller.children

	private _view!:IViewRoot;
	get view(){ return this._view; };

	get static() {
		return <typeof ViewController>this.constructor;
	}

	createRootView():IViewRoot {
		return this.viewFactory.create<IViewRoot>(this.static.ViewInterface);
	}

	init(model: ControllerModel) {
		super.init(model);

		this._view = this.createRootView();
		this._view.gid = this.model.gid;

		// Watch the model for changes
		const s = schema(ViewModel);
		this.model.$watch(s.position, position => {
			const $position = check<Vector3Model>(position, instanceOf(Vector3Model), 'position');
			this.onPositionChanged($position);
		}, { deep, immediate });
		this.model.$watch(s.scale, scale => {
			const $scale = check<number>(scale, isNumber, 'scale');
			this.onScaleChanged($scale);
		}, { deep, immediate });

		// Child views should be attached and detached to this Controller's root
		this.views.events.added.on(event => {
			this.view.add(event.controller.view);
		});
		this.views.events.removed.on(event => {
			this.view.remove(event.controller.view);
		});
	}

	// Can be overridden if initialization is more complex than creating an interface from the ViewFactory.
	createView(model:ControllerModel):IView {
		return this.viewFactory.create<IView>(this.static.ViewInterface);
	}

	// For override
	onClick(event:ViewClickEvent): void {	}

	onPositionChanged(newPosition:Vector3Model) {
		this.view.setPosition(new Vector3(newPosition.x, newPosition.y, newPosition.z));
	}

	onScaleChanged(newScale:number) {
		this.view.setScale(new Vector3(newScale, newScale, newScale));
	}
}
