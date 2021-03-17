import PropertySync from "@/Controller/PropertySync";
import ControllerList from "@/Controller/ControllerList";
import Mozel, {Collection} from "mozel";
import {check, Constructor, instanceOf} from "validation-kit";
import ControllerModel from "@/models/ControllerModel";
import Controller, {ControllerConstructor} from "@/Controller";
import ControllerFactory from "@/Controller/ControllerFactory";

export default class ControllerListSync<P extends ControllerModel, C extends Controller> extends PropertySync<Collection<P>, ControllerList<C>> {
	ControllerModelClass:Constructor<P>;
	ControllerClass:ControllerConstructor<C>;
	factory:ControllerFactory;

	constructor(watchModel:Mozel, path:string, PropertyType:Constructor<P>, SyncType:ControllerConstructor<C>, factory:ControllerFactory) {
		super(watchModel, path, Collection, ControllerList);
		this.ControllerModelClass = PropertyType;
		this.ControllerClass = SyncType;
		this.factory = factory;
	}

	protected syncValue(collection:Collection<P>, createNonExisting:boolean) {
		let controllerList = new ControllerList<C>();
		collection.onAdded(model => {
			const $model = check<P>(model, instanceOf(this.ControllerModelClass), this.ControllerModelClass.name, 'model');
			const controller = this.factory.resolve<C>($model, this.ControllerClass, createNonExisting);

			if(controller && !controllerList.has(controller)) {
				controllerList.add(controller);
			}
		});
		collection.onRemoved(model => {
			const $model = check<P>(model, instanceOf(this.ControllerModelClass), this.ControllerModelClass.name, 'model');
			const controller = this.factory.registry.byGid($model.gid);
			if(controller instanceof this.ControllerClass) {
				controllerList.remove(controller);
			}
		});

		// Add items individually to trigger events
		const children = collection.map((model:ControllerModel) => this.factory.resolve<C>(model, this.ControllerClass, createNonExisting));
		children.forEach(controller => controllerList!.add(controller)); // add one by one to also trigger events

		return controllerList;
	}

	get() {
		const current = super.get();
		return current || new ControllerList<C>();
	}
}
