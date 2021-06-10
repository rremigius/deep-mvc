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
	// ...
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

### 1. Hierarchy - `onSetParent`

Called from the constructor. Is called for any Components that are created as child component. Hierarchy is created
before any Component initialization stage, so note that the Component, as well as its parent, is not yet initialized.

### 2. Initialization - `onInit`

Called from the constructor. Child component watchers are executed immediately. 

### 3. Load - `onLoad`

After initialization, can be called by `component.load()`. Starts initial asynchronous and recursive loading of all components
in the hierarchy. The `onLoad` method can be overridden to do perform the initial asynchronous loading of the component.
Should return a Promise that resolves when the component is done loading.

If none of the components have any loading to do, this stage can be skipped.

### 4. Start - `onStart`

After the component as loaded (or if loading is unneccesary), the component can be started with `component.start()`.
This calls the `onStart` method for all components in the hierarchy.

### 5. Enable - `onEnable`

For a component to be enabled, it needs to be started, and set to be enabled. When this condition changes positively, 
the `onEnable` method is called on the component. If the component starts `enabled`, the first call to `onEnable` will
be at the end of the Start stage.

### 6. Disable - `onDisable`

Components can be disabled, in which case they will stop watching and listening to events. When the 'enabled' state
changes negatively, the `onDisable` method is called.

### 7. Destroy - `onDestroy`

When a component will no longer be used, it should be destroyed (`component.destroy()`). This will destroy the component
and all its child components. For each destroyed component, the `onDestroy` method will be called.

## Events

Components can define and use events that can be listened to. Defining events is done as follows:

```typescript
interface Vector3Interface {x:number, y:number, z:number;}
// Define a 'move' event, which payload is an object with the new position
class ObjectMovedEvent extends ComponentEvent<{position:Vector3Interface}> {}
// Define an Events class, bundling any defined events
class ObjectEvents extends ComponentEvents {
	move = this.$event(ObjectMovedEvent);
}

// Place the events in the component class
class ObjectComponent extends Component {
	//...
	// Define the Events class this component uses
	static Events = ObjectEvents;
	// Override the type for the `events` property
    events!:ObjectEvents;
}

// Use the events anywhere:
component.events.move.on(event => console.log("New position:", event.data.position));
component.events.move.fire(new ObjectMovedEvent(this, {x: 2, y: 10, z: 1}));
```

### EventBus

Using the `Events` class, specific events of specific components can be listened to. Each component is also provided
with a shared EventBus (if created from the same ComponentFactory), allowing to listen to specific events from *any*
component:

```typescript
class ObjectComponent extends Component {
	// ...
	onInit() {
		super.onInit();
		// Listen to move events from any other objects
		this.eventBus.$on(ObjectMovedEvent, event => {
			console.log("Object moved:", event.origin);
			console.log("New position:", event.data.position);
        });
    }
    move() {
		// Fire the event into the eventBus, for anyone to hear
		this.eventBus.$fire(new ObjectMovedEvent(this, {x: 1, y: 4, z: 2}));
    }
}
```

## Actions

Components can define actions that can be called by other components. These are meant as handles for dynamically defined
interaction between components. The definition of actions is similar to events. Example:

```typescript
class ObjectModel extends Mozel {
	@property(ObjectModel)
    target?:ObjectModel;    // Let's say our ObjectModel has another object targeted...
	@property(String)       // .. and a dynamically defined action to call on it
    action?:string;
	@property(Vector3, {required})
    position?:Vector3;
}

// Define the actions:
class MoveAction extends ComponentAction<{position:Vector3Interface}> {}
class ObjectActions extends ComponentActions {
	move = this.$action(MoveAction);
}
// Define the component:
class ObjectComponent extends Component {
	static Model = ObjectModel;
	model!:ObjectModel;
	
    @component(schema(ObjectComponent.Model).target, ObjectComponent)
    target!:ComponentSlot<ObjectComponent>;
    
	static Actions = ObjectActions;
	actions!:ObjectActions;
	
	onInit() {
		super.onInit();
		this.actions.move.on(action => {
			// Move itself
			this.model.position = this.model.create(Vector3, position);
        })
    }
    
    callTargetAction(payload:any) {
		const target = this.target.current;
		if(!target) return;
		
		this.target.callAction(this.model.action, payload);
    }
    
    moveTarget() {
		this.model.action = "MoveAction";
		this.callTargetAction({x: 10, y: 10, z: 10});
    }
}

```

## ReactView
