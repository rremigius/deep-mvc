MozelCC
=======

MozelCC implements a hierarchical model-component architecture, which can optionally be setup as an MCV.
In the basis, both a controller and a view are considered components taking care of a specific aspect of a model.
That way, any number of component 'layers' can be added to a hierarchical model structure. For example, an architecture
could be setup for each model to have a controller and a view (MCV), a controller and 2 views (MCVV) or even just a
single view (MV).

How to distribute the responsibilities between the components is entirely up to you. MozelCC simply provides a mechanism
for nested components to closely follow the structure of a nested model: 
for each model in the hierarchy, a corresponding component can be generated, 
and if a model's children change, so will each of its corresponding components' children.

## Getting Started

The ground-truth of the architecture is the model. The model will define which components will be generated:

```typescript
class ObjectModel extends Mozel {
	@property(Vector3, {required})
	position!: Vector3

	// Hierarchy
    @property(ObjectModel)
    child?:ObjectModel;
    
	@collection(ObjectModel)
	children!: Collection<ObjectModel>;
}
```

Then we define a Component to be generated based on the model:

```typescript
class ObjectComponent extends Component {
	static Model = ObjectModel; // specify the model for which this component works
	model!: ObjectModel; // just to tell Typescript the type of model

    // Define the single child component based on the `child` property of the model, which is an ObjectModel.
    // Therefore, we expect it to generate an ObjectComponent.
	@component(schema(ObjectComponent.Model).child, ObjectComponent)
	child!: ComponentSlot<ObjectComponent>;
    
    // Define child components based on the `children` collection of the model, which is a collection of ObjectModels. 
    // Therefore, we expect it to generate ObjectComponents.
	@components(schema(ObjectComponent.Model).children, ObjectComponent)
	children!: ComponentList<ObjectComponent>;
}
```

At the core, we need something to generate our hierarchy, based on a set of available componennts. 
That is the ComponentFactory:

```typescript
const componentFactory = new ComponentFactory();
// Register our available Components
componentFactory.register(ObjectComponent);
// This will register ObjectController as the component for ObjectModel (as specified in the ObjectController)
```

Finally, we can create a model and generate our component hierarchy:

```typescript
// Create model
const modelFactory = ObjectModel.createFactory();
const model = modelFactory.createAndResolveReferences(ObjectModel, {
	position: {x: 10, y: 0, z: 0},
    child: modelFactory.create(ObjectModel),
	children: [
		modelFactory.create(ObjectModel)
    ]
});

// Generate components
const component = controllerFactory.createAndResolveReferences(model);

// Verify component hierarchy matches model hierarchy
const childModel = model.child;
const childComponent = component.child.current;
assert.equal(childModel, childComponent.model);

const childrenModel = model.children.get(0);
const childrenComponent = component.children.get(0);
assert.eequal(childrenModel, childrenComponent.model);
```

## Change watching

There are several ways to watch for changes in the model, as well as in the component hierarchy:

1. Watch model changes.
2. Child components being added/removed/switched.
3. Current component being changed to a different parent.

```typescript
class ObjectComponent extends Component {
	static Model = ObjectModel; // specify the model for which this component works
	model!: ObjectModel; // just to tell Typescript the type of model

	@component(schema(ObjectComponent.Model).child, ObjectComponent)
	child!: ComponentSlot<ObjectComponent>;
    
	@components(schema(ObjectComponent.Model).children, ObjectComponent)
	children!: ComponentList<ObjectComponent>;
    
    onInit() {
    	super.onInit();

		// 1. Watch position model (deeply)
		this.watch(schema(ObjectComponent.Model).position, position => {
			console.log("Position changed!");
		}, {deep});
    	
    	// 2. Watch child components
        this.child.events.change.on(child => console.log("Child changed!"));
    	this.children.events.add.on(child => console.log("Child added!", child));
    	this.children.events.remove.on(child => console.log("Child removed!", child));
    }
    
    // 3. Current component being changed to a different parent.
    onSetParent(parent:Component) {
    	super.onSetParent(parent);
    	console.log("Parent changed!");
    }
}
```

## Maintaining a (third-party) view hierarchy

In the basis, components are view-agnostic and can use any rendering engine. 
They will have to be setup to maintain the external hierarchy.

```typescript
class ThreeObjectView extends Component {
	static Model = ObjectModel;
	model!:ObjectModel;
	
	@components(schema(ThreeObjectView).children, ThreeObjectView)
    children!:ComponentList<ThreeObjectView>;
	
	threeObject?:THREE.Object3D;
	
	onInit() {
		super.onInit();
		
		// Create a THREE Object3D for this view
		this.threeObject = new THREE.Object3D();
		
		// Watch the children to add/remove their THREE Object3Ds to/from this one 
		this.children.events.add.on(child => {
			if(child.threeObject) this.threeObject.add(child.threeObject);
        });
		this.children.events.remove.on(child => {
			if(child.threeObject) this.threeObject.remove(child.threeObject);
        });
    }
}
```

Any ThreeObjectView's `threeObject` can then be used in a THREE rendering setup.

## Interconnecting components

Sometimes, as in the case of an MCV, one component should be able to contact another component of the same model
(e.g. the View can contact the Controller and/or vice-versa). To accomplish this, we can inject the controller registry
into the View, through the factories:

```typescript
const controllerFactory = new ComponentFactory();
const viewFactory = new ViewFactory();

// Add the 'controllerRegistry' dependency and bind it to the registry of the controller factory
viewFactory.dependencies.bind("ControllerRegistry").toConstantValue(controllerFactory.registry);

class View extends Component {
	controller!:Component;
	onInit() {
		super.onInit();
		// Use the dependencies to get the controller registry
		const controllerRegistry = this.dependencies.get("ControllerRegistry");
		// Then find the controller matching the view. Since they are based on the same model, they should have the same `gid`.
		this.controller = controllerRegistry.byGid(this.gid);
    }
}
```

## Component lifecycle

Components have a lifecycle, each with their corresponding 'hooks', or methods available for override. 
Below are the lifecycle stages:

### Constructor

The Component constructor includes a few stages:

#### Setup Actions and Events (`onSetupEventsAndActions`)

Setup or override `events` and `actions` properties. Each subclass has the opportunity to override `events` or `actions` 
with a more specific version, adding possible events and actions. In later stages, these should not be overridden 
anymore, as it would remove existing listeners and bindings.

#### Bind Actions (`onBindActions`)

Bind methods to actions, e.g.:

```typescript
this.actions.kill.on(this.onKillAction.bind(this));
```

#### Initialize child components

Child components setup with `@component` or `@components` are setup in this stage.

#### Initialize component itself (`onInit`)

Called from Component constructor,

## Enable/disable components




## Events

(and EventBus)

## ReactView
