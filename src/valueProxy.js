import _ from 'lodash';

class ValueNode {
    constructor(value, options = {}, path = 'root', error) {
        this._value = value;
        this._path = path;
        this._error = error;
        this._options = {
            autoLog: this._optionDefault(options, 'autoLog', false)
        };
        // lodash functions
        this.$_find = this._lodashDecorator('find', _.find, 0);
    }
    _optionDefault(options, name, defaultValue) {
        return name in options ? options[name] : defaultValue;
    }
    _nextError(nextValue, nextPath) {
        return nextValue === undefined
            ? {
                $path: nextPath,
                $lastPath: this._path,
                $lastValue: this._value
            }
            : undefined;
    }
    _nextValue(nextValue, nextPath) {
        const nextError = this._error || this._nextError(nextValue, nextPath);
        return valueProxy(nextValue, this._options, nextPath, nextError); // eslint-disable-line no-use-before-define
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
        const value = this._value;
        if (this._options.autoLog && value === undefined) {
            this.$log();
        }
        return value;
    }
    $error() {
        return this._error;
    }
    $log() {
        /* eslint-disable no-console */
        const value = this._value;
        console.group(this._path, '=', value);
        if (value === undefined) {
            console.log('Undefined since:', this._error.$path);
            console.log('Last defined value:', this._error.$lastPath, '=', this._error.$lastValue);
        }
        console.groupEnd('');
        console.log('');
        return this;
        /* eslint-enable no-console */
    }
}

const valueProxy = (() => {
    const handler = {
        get(obj, prop) {
            // default behaviour for symbol prop names
            if (typeof prop === 'symbol') {
                return Reflect.get(obj, prop);
            }
            // auto-bind public methods to enable access to privates
            if (prop.startsWith('$')) {
                const value = Reflect.get(obj, prop);
                if (typeof value === 'function') {
                    return value.bind(obj);
                }
            }
            // hide private methods
            if (prop.startsWith('_')) {
                return undefined;
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
    return (object, options, path, error) => new Proxy(new ValueNode(object, options, path, error), handler);
})();

export default valueProxy;
