import _ from 'lodash';

class ValueNode {
	constructor(value, path = 'root', error) {
    	this._value = value;
        this._path = path;
        this._error = error;
        // lodash functions
        this.$_find = this._lodashDecorator('find', _.find, 0);
    }
    _nextValue(nextValue, nextPath) {
        const nextError = this._error || (
            nextValue === undefined
            ? {
                $path: nextPath,
                $lastPath: this._path,
                $lastValue: this._value
            }
            : undefined
        );
        return valueProxy(nextValue, nextPath, nextError);
    }
    _lodashDecorator(funcName, func, valueParamIndex) {
        return (...params) => {
            const paramsWithValue = params
                    .slice(0, valueParamIndex)
                    .concat([this._value], params.slice(valueParamIndex)),
                nextValue = func(...paramsWithValue),
                nextPath = `${this._path}.$_${funcName}(${params.map(JSON.stringify)})`;
            return this._nextValue(nextValue, nextPath);
        };
    }
    $value() {
        return this._value;
    }
    $error() {
        return this._error;
    }
    $log() {
    	const value = this._value;
    	console.group(this._path, '=', value);
        if (value === undefined) {
            console.log('Undefined since:',this._error.$path);
            console.log('Last defined value:', this._error.$lastPath, '=', this._error.$lastValue);
        }
        console.groupEnd('');
        console.log('');
        return this;
    }
}

export const valueProxy = (() => {
    const handler = {
        get(obj, prop, receiver) {
            // default behaviour for symbol prop names
            if (typeof prop === 'symbol') {
            	return Reflect.get(obj, prop);
            }
            // auto-bind public methods to enable access to privates
            if (prop.startsWith('$')) {
            	let value = Reflect.get(obj, prop);
                if (typeof value === 'function') {
                    value = value.bind(obj);
                }
                return value;
            }           
            // hide private methods
            if (prop.startsWith('_')) {
                return;
            }
            // are we an array/object?
            const nextValue = typeof obj._value === 'object'
                    ? Reflect.get(obj._value, prop)
                    : undefined,
                nextPath = Array.isArray(obj._value)
                	? `${obj._path}[${prop}]`
                    : `${obj._path}.${prop}`;
            return obj._nextValue(nextValue, nextPath);
        }
    };
    return (object, path, error) => new Proxy(new ValueNode(object, path, error), handler);
})();
