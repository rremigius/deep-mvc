Mozel Component
=======

Mozel Component implements a hierarchical model-component architecture, which can optionally be setup as an MCV.
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

The `watch` method will start watching the model, but only when the component is enabled. 
To keep watching even if the component is disabled, use `watchAlways`.

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

## Enable/disable

Components can be enabled and disabled. Disabling a component will also disable its children. Re-enabling will only
re-enable those children that were enabled themselves. By default, enabling/disabling of components is managed by an
internal state of the component. If the model has an `enabled` property, it will use that intead of the internal state,
making it easy for components in all layers to see (and change) the enabled state.

Another model property can also be chosen to represent the enabled state of the component, by setting the
`this.enabledProperty` in the `onInit` method. The `enable` method will use this property to set the enabled state
(or use the default internal property if the given property name does not exist on the model).

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
```

You can listen to events directly:

```typescript
// Use the events anywhere:
component.events.move.on(event => console.log("New position:", event.data.position));
component.events.move.fire(new ObjectMovedEvent(this, {x: 2, y: 10, z: 1}));
```

However, from a component, it is better to use `listenTo`, as this will stop listening when the component is disabled
or destroyed:

```typescript
this.listenTo(otherComponent.events.move, event => console.log("New position:", event.data.position));
```

Or listen to a dynamically defined event:

```typescript
dynamicEvent:string = "...";
this.listentoEventName(otherComponent.events, dynamicEvent, event => console.log("Event fired!", event));
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

To stop listening when disabled or destroyed, use `listenTo` or `listenToEventName`, e.g.:

```typescript
this.listenTo(otherComponent.events.move, event => console.log("New position:", event.data.position));
this.listenToEventName(otherComponent.events, myEventName, event => console.log("Event fired!", event));
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
	
	// Define ComponentSlot for target
    @component(schema(ObjectComponent.Model).target, ObjectComponent)
    target!:ComponentSlot<ObjectComponent>;
    
    // Define actions
	static Actions = ObjectActions;
	actions!:ObjectActions;
	
	onInit() {
		super.onInit();
		
		// When action is called, position should be changed
		this.actions.move.on(action => {
			// Move itself
			this.model.position = this.model.create(Vector3, position);
        })
    }
    
    callTargetAction(payload:any) {
		const target = this.target.current;
		if(!target) return;
		
		// Call the currently set action on the current `target` child component
		this.target.callAction(this.model.action, payload);
    }
    
    moveTarget() {
		// The action to call is determined by the model, so we set the model to the move action
		this.model.action = "MoveAction";
		// Then we call the target action with the new position
		this.callTargetAction({x: 10, y: 10, z: 10});
    }
}

```

## Interconnecting components

Sometimes, as in the case of an MCV, one component should be able to contact another component of the same model
(e.g. the View can contact the Controller and/or vice-versa). One way to accomplish this is to provide the Registry
of the component counterparts to each of the components, e.g. by dependency injection:

```typescript
const controllerFactory = new ComponentFactory();
const viewFactory = new ViewFactory();

// Add the 'controllerRegistry' dependency and bind it to the registry of the controller factory
viewFactory.dependencies.bind("ControllerRegistry").toConstantValue(controllerFactory.registry);
// Note: `dependencies` is an [Inversify](https://inversify.io/) container.

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

## Views

Although components themselves are view-agnostic and have no concept of HTML or rendering built-in, they are well-suited
as the base of any type of View, allowing multiple View hierarchies to exist side-by-side.

### Maintaining a (third-party) view hierarchy

Since components are view-agnostic, they will have to be setup to maintain the external view hierarchy. Fortunately,
this can be easily achieved using hooks and watchers:

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

## ReactView

Already included in this library is a ReactView class, wrapping React Components in the View component class and
recursively rendering the components in the hierarchy.

This is the basic setup (in TSX):

```tsx
type Props = ReactViewComponentProps<MyView>;
type State = {};

class MyViewReact extends ReactViewComponent<Props, State> {
	render() {
		// We can use this.view to access the View, and `this.model` to access the model directly
		return <div>
            Name: {this.model.name} <br/>
            Children: <br/>
            {
            	// go through a ComponentList and render any ReactViews in the list
            	this.renderChildren(this.view.children)
            }
		</div>
    }
}
export default class MyView extends ReactView {
	static Model = MyModel;
	model!:MyModel;
	
	@components(schema(MyView.Model).children, ReactView)
    children!:ComponentList<ReactView>;
    
	getReactComponent():typeof React.Component {
		return MyViewReact as typeof React.Component;
	}
}
```

By default, ReactViewComponents will update when any of its model's *direct properties* change, as defined in `onInitWatchers`:

```typescript
this.watch('*', () => {
    this.forceUpdate();
});
```

To change this behaviour, override the `onInitWatchers` method to add watchers. Leave out `super.onInitWatchers` to
prevent watching all direct properties for changes.
