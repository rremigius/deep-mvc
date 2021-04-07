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
import {schema} from "mozel";

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
		const root = this.viewFactory.create<IViewRoot>(this.static.ViewInterface);
		root.gid = this.model.gid;
		return root;
	}

	init(model: ControllerModel) {
		super.init(model);

		this._view = this.createRootView();

		// Watch the model for changes
		this.model.$watch({
			path: 'position',
			deep: true,
			immediate: true,
			handler: position => {
				const $position = check<Vector3Model>(position, instanceOf(Vector3Model), 'position');
				this.onPositionChanged($position);
			}
		});
		this.model.$watch({
			path: 'scale',
			deep: true,
			immediate: true,
			handler: scale => {
				const $scale = check<number>(scale, isNumber, 'scale');
				this.onScaleChanged($scale);
			}
		});

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
