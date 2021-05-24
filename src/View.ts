import Vector3, {SparseVector3} from "@/Engine/views/common/Vector3";
import {isString} from 'lodash';
import Model, {alphanumeric, CollectionSchema, MozelSchema, Registry} from "mozel";
import {inject, injectable, LazyServiceIdentifer, optional} from "inversify";
import ViewFactory from "./View/ViewFactory";
import Property from "mozel/dist/Property";
import ViewSlot from "./View/ViewSlot";
import ViewList from "./View/ViewList";
import Controller, {ControllerConstructor} from "./Controller";

export type ViewConstructor<T extends View> = {
	new (...args: any[]): T;
	ModelClass:(typeof Model);
	type:string;
};

export type ViewSlotDefinition = {property:string, modelPath:string, ExpectedViewClass:ViewConstructor<any>};
export type ViewListDefinition = {property:string, modelPath:string, ExpectedViewClass:ViewConstructor<any>};

// DECORATORS

export function view<V extends View, M extends V['model']>(
	modelPath:string|MozelSchema<M>,
	ExpectedViewClass:ViewConstructor<V>
) {
	return function (target: View, propertyName: string) {
		if(!isString(modelPath)) modelPath = modelPath.$path;
		target.static.defineViewSlot(propertyName, modelPath, ExpectedViewClass);
	};
}

export function views<V extends View, M extends V['model']>(
	modelPath:string|CollectionSchema<M>,
	ExpectedViewClass:ViewConstructor<V>
) {
	return function (target: View, propertyName: string) {
		if(!isString(modelPath)) modelPath = modelPath.$path;
		target.static.defineViewList(propertyName, modelPath, ExpectedViewClass);
	}
}

@injectable()
export default class View {
	static ModelClass = Model;

	static get type() { return this.name }

	private static _classViewSlotDefinitions: ViewSlotDefinition[] = [];
	private static _classViewListDefinitions: ViewListDefinition[] = [];

	public static get classViewSlotDefinitions() {
		// Override _classPropertyDefinitions so this class has its own set and it will not add its properties to its parent
		if (!this.hasOwnProperty('_classViewSlotDefinitions')) {
			this._classViewSlotDefinitions = [];
		}
		return this._classViewSlotDefinitions;
	}

	public static get classViewListDefinitions() {
		// Override _classPropertyDefinitions so this class has its own set and it will not add its properties to its parent
		if (!this.hasOwnProperty('_classControllerListDefinitions')) {
			this._classViewListDefinitions = [];
		}
		return this._classViewListDefinitions;
	}

	static defineViewSlot(property:string, modelPath:string, ExpectedViewClass:ViewConstructor<any>) {
		this.classViewSlotDefinitions.push({property, modelPath, ExpectedViewClass});
	}

	static defineViewList(property:string, modelPath:string, ExpectedViewClass:ViewConstructor<any>) {
		this.classViewListDefinitions.push({property, modelPath, ExpectedViewClass});
	}

	readonly id?:alphanumeric;
	readonly gid?:alphanumeric;

	_parent?:View;
	get parent() { return this._parent };

	readonly model:Model;
	registry:Registry<View>;
	factory:ViewFactory;
	controllerRegistry:Registry<Controller>;

	position:Vector3;
	scale:Vector3;
	visible:boolean = true;
	name:string = "View";

	_children:Record<string, ViewSlot<View>|ViewList<View>> = {};
	get children() { return this._children }

	constructor(
		@inject(new LazyServiceIdentifer(()=>Model)) model:Model,
		@inject(new LazyServiceIdentifer(()=>ViewFactory)) @optional() viewFactory:ViewFactory,
		@inject(Registry) @optional() registry:Registry<View>,
		@inject("ControllerRegistry") @optional() controllerRegistry:Registry<Controller>
	) {
		this.position = new Vector3(0,0,0);
		this.scale = new Vector3(1,1,1);

		this.model = model;
		this.id = this.model.id;
		this.gid = this.model.gid;

		this.registry = registry || new Registry<View>();
		this.factory = viewFactory || new ViewFactory();
		this.controllerRegistry = controllerRegistry || new Registry<Controller>();

		this.initClassDefinitions();
		this.init();
	}

	init() {
		// For override
	}

	findController<C extends Controller>(ExpectedControllerClass:ControllerConstructor<C>):C|undefined {
		const controller = this.controllerRegistry.byGid(this.model.gid);
		if(controller && !(controller instanceof ExpectedControllerClass)) {
			throw new Error(`View '${this.static.type}' expected '${ExpectedControllerClass.name}' as controller.`)
		}
		return controller;
	}

	requireController<C extends Controller>(ExpectedControllerClass:ControllerConstructor<C>):C {
		const controller = this.findController<C>(ExpectedControllerClass);
		if(!controller) {
			throw new Error(`No controller found for ${this.static.type} (GID: ${this.model.gid}.`);
		}
		return controller;
	}

	initClassDefinitions() {
		// To be called for each class on the prototype chain
		const _defineData = (Class: typeof View) => {
			if (Class !== View) {
				// Define class properties of parent class
				_defineData(Object.getPrototypeOf(Class));
			}
			// Define class properties of this class
			Class.classViewSlotDefinitions.forEach(definition => {
				(this as any)[definition.property] = this.view(definition.modelPath, definition.ExpectedViewClass);
			});
			Class.classViewListDefinitions.forEach(definition => {
				(this as any)[definition.property] = this.views(definition.modelPath, definition.ExpectedViewClass);
			});
		};
		_defineData(this.static);
	}

	view<M extends Model, V extends View>(modelPath:string|Property, ViewClass:ViewConstructor<V>) {
		if(modelPath instanceof Property) {
			modelPath = modelPath.getPathFrom(this.model);
		}
		const sync = new ViewSlot<V>(this, this.model, modelPath, ViewClass.ModelClass, ViewClass, this.factory);
		sync.startWatching();

		this.children[modelPath] = sync as unknown as ViewSlot<View>;

		return sync;
	}

	views<M extends Model, V extends View>(modelPath:string|Property, ViewClass:ViewConstructor<V>) {
		if(modelPath instanceof Property) {
			modelPath = modelPath.getPathFrom(this.model);
		}
		const list = new ViewList<V>(this, this.model, modelPath, ViewClass.ModelClass, ViewClass, this.factory);
		list.startWatching();

		this.children[modelPath] = list as unknown as ViewList<View>;

		return list;
	}

	get static() {
		return <typeof View>this.constructor;
	}

	getPosition() {
		return this.position;
	}

	getScale() {
		return this.scale;
	}

	isVisible() {
		return this.visible;
	}

	destroy() {
		this.onDestroy();
	}

	setParent(parent?:View) {
		this._parent = parent;
	}

	setName(name: string) {
		this.name = name;
	}

	setPosition(position: Vector3 | SparseVector3) {
		this.position = Vector3.create(position);
	}

	setScale(scale: Vector3 | SparseVector3) {
		this.scale = Vector3.create(scale);
	}

	setVisible(visible: boolean) {
		this.visible = visible;
	}

	onAdd(child:View) {
		// For override
	}

	onRemove(child:View) {
		// For override
	}

	onDestroy() {
		// For override
	}
}
