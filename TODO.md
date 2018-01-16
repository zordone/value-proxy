# TODO

* Include more lodash: filter, sortBy, uniq, pluck, ...
* Add map/filter/reduce methods
* Method error handling. (Ex: calling map on a number -> `$error`. Add error types: undefined, method doesn't exists, method returned undefined, etc)
* Add `$default` method (is it really useful?)
* Add `$throw` method (same as `$value` but throws if undefined)
* Finish readme
* Test that find, and the other methods return proxy for undefined
* Make lodash optional dependency
* Support browsers/node.js without `console.group`