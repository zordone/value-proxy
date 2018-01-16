# value-proxy

A small, proxy-based library for cleaner and safer model traversal.

## Quick example

If we have to work with model objects in which any field could be missing/undefined/null, this expression can throw "undefined is not an object" error:

    const dogName = model.person.dogs[0].name;
    
So we have to check each field before using it:

    const dogName = model &&
        model.person && 
        model.person.dogs && 
        model.person.dogs.length && 
        model.person.dogs[0].name;

With `value-proxy`, we can write the same thing like this:

    const safeModel = valueProxy(model);
    const dogName = safeModel.person.dogs[0].name.$value();
    
This won't throw any errors, we just get `undefined` if any of the fields is missing/undefined/null.


## Features

* Guards against `undefined` anywhere in the expression.
* Supports objects and arrays.
* Keeps detailed debug information about where in the expression we got `undefined`, and what was the last valid value.
* Can inline lodash calls in the chain and keep the logical order of things.


# Logging

If for debug reasons, you need to log something out, you can just write `$log()` anywhere in the chain:

    safeModel.person.dogs[0].$log().name.$value();

This will log the value of the "dog" object, and also some extra debug info if it's undefined:

    > root.person.dogs[0] = undefined
    >     Undefined since: root.person.dogs
    >     Last defined value: root.person = { name: "Cat Person", cats: [...] }


Finally, there is an auto-log for automatically logging out this debug info for every undefined expression.

    const safeModel = valueProxy(model, { autoLog: true });
    
    safeModel.person.dogs[0].name.$value();
    // { name: "Laika", ... }
    
    safeModel.person.dogs[1].name.$value();
    // { name: "Belka", ... }
    
    safeModel.person.dogs[2].name.$value();
    // root.person.dogs[2].name = undefined
    //     Undefined since: root.person.dogs[2]
    //     Last defined value: root.person.dogs = [...]


## Lodash integration

We can use some `lodash` methods in the chain too. With a special syntax.

    safeModel.person.dogs.$_find({ id: 3 }).name.$value();
    
Lodash methods start with `$_` and you don't need to pass the object/collection because it receives it from the chain. This is more natural, and it keeps the logical order of things. 

With lodash, `find` would be at the beginning, which is kind of inside-out:

    _.find(model.person.dogs, { id: 3 }).name;


## Notes

#### Under construction

The library is not complete yet. It's a proof of concept. I have a bunch of other ideas and TODOs. (See TODO.md if you're interested.)

The only `lodash` method so far is `$_find`, but it's only a one-liner to add a new one.

#### Performance

Since the library is based on Proxy, performance is still an issue. (But it became 25% percent in the last 8 months.)

I think it's acceptable for small/medium use cases, but I don't recommend it for heavily used objects.

#### Proxy

If you want to learn more about the Proxy, I recommend reading my in depth [blog post](http://dealwithjs.io/es6-features-10-use-cases-for-proxy/) about it.