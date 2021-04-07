import Controller, {controllers} from "@/Controller";
import IView, {IViewSymbol} from "@/IView";
import ControllerModel from "@/ControllerModel";
import IViewRoot, {IViewRootSymbol, ViewClickEvent} from "@/IViewRoot";
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

	private _root!:IViewRoot;
	get root(){ return this._root; };

	protected _view!:IView;
	get view() { return this._view; };

	get static() {
		return <typeof ViewController>this.constructor;
	}

	createRootView(model:ControllerModel, view:IView):IViewRoot {
		const root = this.viewFactory.create<IViewRoot>(IViewRootSymbol);
		root.gid = model.gid;
		root.events.click.on(event => this.onClick(event));

		// Create the view and add to root
		root.add(view);

		return root;
	}

	init(model: ControllerModel) {
		super.init(model);

		// Create the View
		this._view = this.createView(model);
		// Wrap in root
		this._root = this.createRootView(model, this._view);

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
			this.root.add(event.controller.root);
		});
		this.views.events.removed.on(event => {
			this.root.remove(event.controller.root);
		});
	}

	// Can be overridden if initialization is more complex than creating an interface from the ViewFactory.
	createView(model:ControllerModel):IView {
		return this.viewFactory.create<IView>(this.static.ViewInterface);
	}

	// For override
	onClick(event:ViewClickEvent): void {	}

	onPositionChanged(newPosition:Vector3Model) {
		this.root.setPosition(new Vector3(newPosition.x, newPosition.y, newPosition.z));
	}

	onScaleChanged(newScale:number) {
		this.root.setScale(new Vector3(newScale, newScale, newScale));
	}
}
