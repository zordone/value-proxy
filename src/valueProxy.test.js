import { mockData } from './mockData';
import { valueProxy } from './valueProxy';

// mock console
global.console.log = jest.fn();
global.console.group = jest.fn();
global.console.groupEnd = jest.fn();

describe('ValueProxy', () => {

    let root;

    beforeEach(() => {
        global.console.log.mockClear();
        global.console.group.mockClear();
        global.console.groupEnd.mockClear();
        root = valueProxy(mockData);
    });

    test('privates are not accessible', () => {
        expect(root._nextValue).toBeUndefined();
        expect(root._lodashDecorator).toBeUndefined();
    });

    describe('valid data', () => {
        test('starts with the full value', () => {
            expect(root.$value).toBe(mockData);
            expect(root.$error).toBeUndefined();
        });
        test('single property access', () => {
            const result = root.metadata;
            expect(result.$value).toBe(mockData.metadata);
            expect(result.$error).toBeUndefined();
        });
        test('multiple property access', () => {
            const result = root.metadata.url;
            expect(result.$value).toBe(mockData.metadata.url);
            expect(result.$error).toBeUndefined();
        });
        test('array, object and primitive props', () => {
            const result = root.channels[0].programs[0].isLive;
            expect(result.$value).toBe(mockData.channels[0].programs[0].isLive);
            expect(result.$error).toBeUndefined();
        });
    });

    describe('missing data', () => {
        test('single missing property', () => {
            const result = root.foo;
            expect(result.$value).toBeUndefined();
            expect(result.$error.$path).toBe('root.foo');
            expect(result.$error.$lastPath).toBe('root');
            expect(result.$error.$lastValue).toBe(mockData);
        });
        test('chain of missing properties', () => {
            const result = root.foo.bar;
            expect(result.$value).toBeUndefined();
            expect(result.$error.$path).toBe('root.foo');
            expect(result.$error.$lastPath).toBe('root');
            expect(result.$error.$lastValue).toBe(mockData);
        });
        test('missing property later in the chain', () => {
            const result = root.channels[0].foo.bar;
            expect(result.$value).toBeUndefined();
            expect(result.$error.$path).toBe('root.channels[0].foo');
            expect(result.$error.$lastPath).toBe('root.channels[0]');
            expect(result.$error.$lastValue).toBe(mockData.channels[0]);
        });
        test('missing array index', () => {
            const result = root.channels[999];
            expect(result.$value).toBe(undefined);
            expect(result.$error.$path).toBe('root.channels[999]');
            expect(result.$error.$lastPath).toBe('root.channels');
            expect(result.$error.$lastValue).toBe(mockData.channels);
        });
    });

    describe('$log', () => {
        test('logs defined value', () => {
            root.metadata.$log();
            expect(global.console.group).toHaveBeenCalledWith('root.metadata', '=', mockData.metadata);
            expect(global.console.groupEnd).toHaveBeenCalledWith('');
        });
        test('logs undefined value', () => {
            root.foo.$log();
            expect(global.console.group).toHaveBeenCalledWith('root.foo', '=', undefined);
            expect(global.console.log).toHaveBeenCalledWith('Undefined since:', 'root.foo');
            expect(global.console.log).toHaveBeenCalledWith('Last defined value:', 'root', '=', mockData);
            expect(global.console.groupEnd).toHaveBeenCalledWith('');
        });
    });

    describe('$_find', () => {
        test('finds object by id', () => {
            const result = root.channels.$_find({ id: 'c1' }).name;
            expect(result.$value).toBe(mockData.channels[0].name);
            expect(result.$error).toBeUndefined();
        });
        test('gives undefined for missing id', () => {
            const result = root.channels.$_find({ id: 'foo' });
            expect(result.$value).toBeUndefined();
            expect(result.$error.$path).toBe('root.channels.$_find({"id":"foo"})');
        });
        test('gives undefined when called on undefined', () => {
            const result = root.foo.$_find({ id: 'c1' });
            expect(result.$value).toBeUndefined();
            expect(result.$error.$path).toBe('root.foo');
        });
    });

});
