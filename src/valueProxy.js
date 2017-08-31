import _ from 'lodash';

class ValueNode {
	constructor(value, path = 'root', error) {
    	this.$value = value;
        this.$path = path;
        this.$error = error;
        // lodash functions
        this.$_find = this._lodashDecorator('find', _.find, 0);        
    }
    _nextValue(nextValue, nextPath) {
        const nextError = this.$error || (
            nextValue === undefined 
            ? {
                $path: nextPath,
                $lastPath: this.$path,
                $lastValue: this.$value
            }
            : undefined
        );    
        return valueProxy(nextValue, nextPath, nextError);
    }    
    _lodashDecorator(funcName, func, valueParamIndex) {
        return (...params) => {
            const paramsWithValue = params
                    .slice(0, valueParamIndex)
                    .concat([this.$value], params.slice(valueParamIndex)),
                nextValue = func(...paramsWithValue),
                nextPath = `${this.$path}.$_${funcName}(${params.map(JSON.stringify)})`;
            return this._nextValue(nextValue, nextPath);
        };        
    }
    $log() {
    	const value = this.$value;
    	console.group(this.$path, '=', value);
        if (value === undefined) {        	
            console.log('Undefined since:',this.$error.$path);
            console.log('Last defined value:', this.$error.$lastPath, '=', this.$error.$lastValue);
        }
        console.groupEnd('');
        console.log('');
        return this;
    }
}

export const valueProxy = (() => {
    const handler = {
        get(obj, prop, receiver) {
            // default behaviour for symbols and public methods
            if (typeof prop === 'symbol' || prop.startsWith('$')) {
            	return Reflect.get(obj, prop);
            }
            // hide private methods
            if (prop.startsWith('_')) {
                return;
            }
            // are we an array/object?
            const nextValue = typeof receiver.$value === 'object' 
                    ? Reflect.get(receiver.$value, prop)
                    : undefined,
                nextPath = Array.isArray(receiver.$value)
                	? `${receiver.$path}[${prop}]`
                    : `${receiver.$path}.${prop}`;
            return obj._nextValue(nextValue, nextPath);
        }
    };
    return (object, path, error) => new Proxy(new ValueNode(object, path, error), handler);
})();
