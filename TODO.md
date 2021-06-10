To Do
=====

- `Mozel.$export()` references should not export recursively
- Component DI based on class rather than `Symbol.for(Component)`?
    Ability to use different Components for the same Model within the same hierarchy, e.g.:
        > Scene
            > Person (gid:1) (Model3DView)
                > Person (ref:(gid:2)) (PhonecallView)
            > Person (gid:2) (Model3DView)
    Idea: provide a separate ViewFactory for one View to generate another View (e.g. UIView to generate a PropertiesView).
- Registry cleanup  
