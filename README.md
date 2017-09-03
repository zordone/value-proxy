# value-proxy

Features:

- Guards against `undefined` anywhere in the expression.
- Keeps detailed debug information about where in the expression we got undefined, and what was the last valid value.
- Can inline lodash calls in the chain and keep the logical order of things.
- Log helper for debugging.

TODO:

- Include more lodash?
- Add map/filter/reduce methods
- Method error handling. (Ex: calling map on a number -> $error, add error types: undefined, method doesn't exists, method returned undefined)
- Change $value to a method. Auto log if `undefined`. Change $error too?
- Add `$default` method
- Add `$throw` method
- Finish readme
- Linter check