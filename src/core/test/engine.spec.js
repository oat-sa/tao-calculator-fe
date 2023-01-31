/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2018-2023 (original work) Open Assessment Technologies SA ;
 */

import engineFactory from '../engine.js';

describe('engine', () => {
    it('is a factory', () => {
        expect(engineFactory).toEqual(expect.any(Function));
        expect(engineFactory()).toEqual(expect.any(Object));
        expect(engineFactory()).not.toStrictEqual(engineFactory());
    });

    describe('manages events', () => {
        it('registers event listener', () => {
            const calculator = engineFactory();
            const action = jest.fn();

            expect(calculator.on('test', action)).toBe(calculator);

            calculator.trigger('test');

            expect(action).toHaveBeenCalledTimes(1);
        });

        it('removes event listener', () => {
            const calculator = engineFactory();
            const action1 = jest.fn();
            const action2 = jest.fn();

            calculator.on('test', action1);
            calculator.on('test', action2);

            expect(calculator.off('test', action1)).toBe(calculator);

            calculator.trigger('test');

            expect(action1).toHaveBeenCalledTimes(0);
            expect(action2).toHaveBeenCalledTimes(1);
        });

        it('removes all listeners for a particular event', () => {
            const calculator = engineFactory();
            const action1 = jest.fn();
            const action2 = jest.fn();

            calculator.on('test', action1);
            calculator.on('test', action2);

            expect(calculator.off('test')).toBe(calculator);

            calculator.trigger('test');

            expect(action1).toHaveBeenCalledTimes(0);
            expect(action2).toHaveBeenCalledTimes(0);
        });

        it('removes all listeners for all events', () => {
            const calculator = engineFactory();
            const action1 = jest.fn();
            const action2 = jest.fn();

            calculator.on('test', action1);
            calculator.on('foo', action2);

            expect(calculator.off()).toBe(calculator);

            calculator.trigger('test');
            calculator.trigger('foo');

            expect(calculator.off('test')).toBe(calculator);

            expect(action1).toHaveBeenCalledTimes(0);
            expect(action2).toHaveBeenCalledTimes(0);
        });

        it('triggers event listeners', () => {
            const calculator = engineFactory();
            const action1 = jest.fn().mockImplementation(function (param1, param2) {
                expect(this).toBe(calculator);
                expect(param1).toEqual('foo');
                expect(param2).toEqual('bar');
            });
            const action2 = jest.fn().mockImplementation(function (param1, param2) {
                expect(this).toBe(calculator);
                expect(param1).toEqual('foo');
                expect(param2).toEqual('bar');
            });

            calculator.on('test', action1);
            calculator.on('test', action2);

            expect(calculator.trigger('test', 'foo', 'bar')).toBe(calculator);
            expect(action1).toHaveBeenCalledTimes(1);
            expect(action2).toHaveBeenCalledTimes(1);
        });
    });

    describe('exposes', () => {
        it('the tokenizer', () => {
            const calculator = engineFactory();

            expect(calculator.getTokenizer()).toEqual(expect.any(Object));
            expect(calculator.getTokenizer().iterator).toEqual(expect.any(Function));
            expect(calculator.getTokenizer().tokenize).toEqual(expect.any(Function));
        });

        it('the evaluator', () => {
            const calculator = engineFactory();

            expect(calculator.getMathsEvaluator()).toEqual(expect.any(Function));
        });
    });

    describe('manages the expression', () => {
        it('reads the expression', () => {
            const calculator = engineFactory({ expression: '1+2' });

            expect(calculator.getExpression()).toStrictEqual('1+2');
        });

        it('sets the expression', () => {
            const calculator = engineFactory();

            expect(calculator.getExpression()).toStrictEqual('');
            expect(calculator.setExpression('1+2')).toBe(calculator);
            expect(calculator.getExpression()).toStrictEqual('1+2');
        });

        it('emits an expressionchange event', () => {
            const calculator = engineFactory();
            const expression = '(1 + 2) * 3';
            const action = jest.fn().mockImplementation(expr => {
                expect(expr).toStrictEqual(expression);
            });

            calculator.on('expressionchange', action);
            calculator.setExpression(expression);

            expect(action).toHaveBeenCalledTimes(1);
        });

        it('clears the expression', () => {
            const calculator = engineFactory({ expression: '1+2', position: 2 });
            const action = jest.fn();

            calculator.on('clear', action);
            expect(calculator.getExpression()).toStrictEqual('1+2');
            expect(calculator.getPosition()).toStrictEqual(2);

            expect(calculator.clear()).toBe(calculator);
            expect(calculator.getExpression()).toStrictEqual('');
            expect(calculator.getPosition()).toStrictEqual(0);
            expect(action).toHaveBeenCalledTimes(1);
        });

        it('replaces the expression', () => {
            const calculator = engineFactory({ expression: '1+2', position: 1 });

            expect(calculator.getExpression()).toStrictEqual('1+2');
            expect(calculator.getPosition()).toStrictEqual(1);
            expect(calculator.replace('3*4')).toBe(calculator);
            expect(calculator.getExpression()).toStrictEqual('3*4');
            expect(calculator.getPosition()).toStrictEqual(3);
        });

        it('replaces the expression and set the position', () => {
            const calculator = engineFactory({ expression: '1+2' });

            expect(calculator.getExpression()).toStrictEqual('1+2');
            expect(calculator.getPosition()).toStrictEqual(0);
            expect(calculator.replace('3*4', 2)).toBe(calculator);
            expect(calculator.getExpression()).toStrictEqual('3*4');
            expect(calculator.getPosition()).toStrictEqual(2);
        });

        it('emits a replace event', () => {
            const calculator = engineFactory({ expression: '1+2', position: 1 });
            const action = jest.fn().mockImplementation((oldExpression, oldPosition) => {
                expect(oldExpression).toStrictEqual('1+2');
                expect(oldPosition).toStrictEqual(1);
            });

            calculator.on('replace', action);
            calculator.replace('3*4', 2);

            expect(action).toHaveBeenCalledTimes(1);
        });

        it('inserts a sub-expression', () => {
            const calculator = engineFactory({ expression: '1+2', position: 1 });

            expect(calculator.getExpression()).toStrictEqual('1+2');
            expect(calculator.getPosition()).toStrictEqual(1);
            expect(calculator.insert('-3')).toBe(calculator);
            expect(calculator.getExpression()).toStrictEqual('1-3+2');
            expect(calculator.getPosition()).toStrictEqual(3);
        });

        it('inserts a sub-expression at a particular position', () => {
            const calculator = engineFactory({ expression: '1+2', position: 1 });

            expect(calculator.getExpression()).toStrictEqual('1+2');
            expect(calculator.getPosition()).toStrictEqual(1);
            expect(calculator.insert('-3', 3)).toBe(calculator);
            expect(calculator.getExpression()).toStrictEqual('1+2-3');
            expect(calculator.getPosition()).toStrictEqual(5);
        });

        it('emits an insert event', () => {
            const calculator = engineFactory({ expression: '1+2', position: 1 });
            const action = jest.fn().mockImplementation((oldExpression, oldPosition) => {
                expect(oldExpression).toStrictEqual('1+2');
                expect(oldPosition).toStrictEqual(1);
            });

            calculator.on('insert', action);
            calculator.insert('-3');

            expect(action).toHaveBeenCalledTimes(1);
        });

        it('reads the position', () => {
            const calculator = engineFactory({ expression: '1+2', position: 1 });

            expect(calculator.getExpression()).toStrictEqual('1+2');
            expect(calculator.getPosition()).toStrictEqual(1);
        });

        it.each([
            [-1, '1+2', 0],
            [0, '1+2', 0],
            [1, '1+2', 1],
            [2, '1+2', 2],
            [3, '1+2', 3],
            [4, '1+2', 3]
        ])('sets the position %s in the expression %s', (position, expression, expected) => {
            const calculator = engineFactory({ expression });

            expect(calculator.setPosition(position)).toBe(calculator);
            expect(calculator.getPosition()).toStrictEqual(expected);
        });

        it('emits a positionchange event', () => {
            const expression = '(1 + 2) * 3';
            const calculator = engineFactory({ expression });
            const action = jest.fn().mockImplementation(position => {
                expect(position).toStrictEqual(2);
            });

            calculator.on('positionchange', action);
            calculator.setPosition(2);

            expect(action).toHaveBeenCalledTimes(1);
        });
    });

    describe('manages the tokens', () => {
        it('reads all the tokens', () => {
            const calculator = engineFactory();

            expect(calculator.getTokens()).toStrictEqual([]);

            calculator.setExpression('(1 + 2) * 3');
            expect(calculator.getTokens()).toMatchSnapshot();
        });

        it('tokenizes once', () => {
            const calculator = engineFactory();

            calculator.setExpression('(1 + 2) * 3');
            const tokens = calculator.getTokens();
            expect(calculator.getTokens()).toBe(tokens);
        });

        it('tokenizes new expression', () => {
            const calculator = engineFactory();

            calculator.setExpression('(1 + 2) * 3');
            expect(calculator.getTokens()).toMatchSnapshot();

            calculator.setExpression('4 * 5');
            expect(calculator.getTokens()).toMatchSnapshot();
        });

        it('gets a token at the current position', () => {
            const calculator = engineFactory();

            expect(calculator.getToken()).toBeNull();

            calculator.setExpression('(1 + 2) * 3');

            calculator.setPosition(2);
            expect(calculator.getToken()).toMatchSnapshot();

            calculator.setPosition(6);
            expect(calculator.getToken()).toMatchSnapshot();
        });

        it('gets the index of the token at the current position', () => {
            const calculator = engineFactory();

            expect(calculator.getTokenIndex()).toStrictEqual(0);

            calculator.setExpression('(1 + 2) * 3');

            calculator.setPosition(2);
            expect(calculator.getTokenIndex()).toStrictEqual(1);

            calculator.setPosition(6);
            expect(calculator.getTokenIndex()).toStrictEqual(4);
        });
    });

    describe('manages the variables', () => {
        it('sets a variable as a value', () => {
            const calculator = engineFactory();

            expect(calculator.hasVariable('foo')).toBeFalsy();

            expect(calculator.setVariable('foo', 42)).toBe(calculator);
            expect(calculator.hasVariable('foo')).toBeTruthy();
            expect(calculator.getVariable('foo')).toMatchSnapshot();
        });

        it('sets a variable as an expression', () => {
            const calculator = engineFactory();

            expect(calculator.hasVariable('foo')).toBeFalsy();

            expect(calculator.setVariable('foo', '3*4')).toBe(calculator);
            expect(calculator.hasVariable('foo')).toBeTruthy();
            expect(calculator.getVariable('foo')).toMatchSnapshot();
        });

        it('detects error in variable expression', () => {
            const calculator = engineFactory();

            expect(calculator.hasVariable('foo')).toBeFalsy();

            expect(calculator.setVariable('foo', '3*4+')).toBe(calculator);
            expect(calculator.hasVariable('foo')).toBeTruthy();
            expect(calculator.getVariable('foo')).toMatchSnapshot();
        });

        it('emits an variableadd event', () => {
            const calculator = engineFactory();
            const action = jest.fn().mockImplementation((name, value) => {
                expect(name).toStrictEqual('foo');
                expect(value).toBe(calculator.getVariable('foo'));
            });

            calculator.on('variableadd', action);
            calculator.setVariable('foo', '3*4');

            expect(action).toHaveBeenCalledTimes(1);
        });

        it('deletes a variable', () => {
            const calculator = engineFactory();

            expect(calculator.hasVariable('foo')).toBeFalsy();

            calculator.setVariable('foo', 42);
            expect(calculator.hasVariable('foo')).toBeTruthy();

            expect(calculator.deleteVariable('foo')).toBe(calculator);
            expect(calculator.hasVariable('foo')).toBeFalsy();
        });

        it('emits an variabledelete event', () => {
            const calculator = engineFactory();
            const action = jest.fn().mockImplementation(name => {
                expect(name).toStrictEqual('foo');
            });

            calculator.setVariable('foo', '3*4');
            calculator.on('variabledelete', action);
            calculator.deleteVariable('foo');

            expect(action).toHaveBeenCalledTimes(1);
        });

        it('gets variables', () => {
            const calculator = engineFactory();

            calculator.setVariable('foo', 42);
            calculator.setVariable('expr', '4*3');

            expect(calculator.getVariable('foo')).toMatchSnapshot();
            expect(calculator.getVariable('expr')).toMatchSnapshot();
            expect(calculator.getVariables()).toMatchSnapshot();
        });

        it('sets variables from a list', () => {
            const calculator = engineFactory();

            expect(calculator.setVariables({ foo: 42, expr: '4*3' })).toBe(calculator);

            expect(calculator.getVariable('foo')).toMatchSnapshot();
            expect(calculator.getVariable('expr')).toMatchSnapshot();
            expect(calculator.getVariables()).toMatchSnapshot();
        });

        it('deletes all variables', () => {
            const calculator = engineFactory();
            const action = jest.fn().mockImplementation(name => {
                expect(name).toBeNull();
            });

            calculator.on('variabledelete', action);
            calculator.setVariable('foo', 42);
            calculator.setVariable('expr', '4*3');

            expect(calculator.hasVariable('foo')).toBeTruthy();
            expect(calculator.hasVariable('expr')).toBeTruthy();

            expect(calculator.deleteVariables()).toBe(calculator);
            expect(calculator.hasVariable('foo')).toBeFalsy();
            expect(calculator.hasVariable('expr')).toBeFalsy();
            expect(action).toHaveBeenCalledTimes(1);
        });
    });

    describe('manages the last result', () => {
        it('set the last result', () => {
            const calculator = engineFactory();

            expect(calculator.getLastResult()).toMatchSnapshot();

            expect(calculator.setLastResult(42)).toBe(calculator);
            expect(calculator.getLastResult()).toMatchSnapshot();
        });

        it('gracefully ignore error in the last result', () => {
            const calculator = engineFactory();

            calculator.setLastResult(NaN);
            expect(calculator.getLastResult()).toMatchSnapshot();

            calculator.setLastResult(Infinity);
            expect(calculator.getLastResult()).toMatchSnapshot();

            calculator.setLastResult();
            expect(calculator.getLastResult()).toMatchSnapshot();
        });
    });

    describe('manages the commands', () => {
        it('sets a command', () => {
            const calculator = engineFactory();
            const cmd = () => {};

            expect(calculator.hasCommand('foo')).toBeFalsy();

            expect(calculator.setCommand('foo', cmd)).toBe(calculator);
            expect(calculator.hasCommand('foo')).toBeTruthy();
            expect(calculator.getCommand('foo')).toBe(cmd);
        });

        it('emits an commandadd event', () => {
            const calculator = engineFactory();
            const cmd = () => {};
            const action = jest.fn().mockImplementation(name => {
                expect(name).toStrictEqual('foo');
            });

            calculator.on('commandadd', action);
            calculator.setCommand('foo', cmd);

            expect(action).toHaveBeenCalledTimes(1);
        });

        it('deletes a command', () => {
            const calculator = engineFactory();
            const cmd = () => {};

            expect(calculator.hasCommand('foo')).toBeFalsy();

            calculator.setCommand('foo', cmd);
            expect(calculator.hasCommand('foo')).toBeTruthy();

            expect(calculator.deleteCommand('foo')).toBe(calculator);
            expect(calculator.hasCommand('foo')).toBeFalsy();
        });

        it('emits an commanddelete event', () => {
            const calculator = engineFactory();
            const cmd = () => {};
            const action = jest.fn().mockImplementation(name => {
                expect(name).toStrictEqual('foo');
            });

            calculator.setCommand('foo', cmd);
            calculator.on('commanddelete', action);
            calculator.deleteCommand('foo');

            expect(action).toHaveBeenCalledTimes(1);
        });

        it('gets commands', () => {
            const calculator = engineFactory();
            const cmd1 = () => {};
            const cmd2 = () => {};

            calculator.setCommand('foo', cmd1);
            calculator.setCommand('bar', cmd2);

            expect(calculator.getCommand('foo')).toBe(cmd1);
            expect(calculator.getCommand('bar')).toBe(cmd2);
            expect(calculator.getCommands()).toMatchSnapshot();
        });

        it('sets commands from a list', () => {
            const calculator = engineFactory();
            const cmds = {
                foo() {},
                bar() {}
            };

            expect(calculator.setCommands(cmds)).toBe(calculator);

            expect(calculator.getCommand('foo')).toBe(cmds.foo);
            expect(calculator.getCommand('bar')).toBe(cmds.bar);
            expect(calculator.getCommands()).toMatchSnapshot();
        });

        it('deletes all commands', () => {
            const calculator = engineFactory();
            const cmd1 = () => {};
            const cmd2 = () => {};
            const action = jest.fn().mockImplementation(name => {
                expect(name).toBeNull();
            });

            calculator.on('commanddelete', action);
            calculator.setCommand('foo', cmd1);
            calculator.setCommand('bar', cmd2);

            expect(calculator.hasCommand('foo')).toBeTruthy();
            expect(calculator.hasCommand('bar')).toBeTruthy();

            expect(calculator.deleteCommands()).toBe(calculator);
            expect(calculator.hasCommand('foo')).toBeFalsy();
            expect(calculator.hasCommand('bar')).toBeFalsy();
            expect(action).toHaveBeenCalledTimes(1);
        });

        it('calls a command', () => {
            const calculator = engineFactory();
            const cmd = jest.fn().mockImplementation((arg1, arg2) => {
                expect(arg1).toStrictEqual(42);
                expect(arg2).toStrictEqual('bar');
            });

            calculator.setCommand('foo', cmd);

            expect(calculator.useCommand('foo', 42, 'bar')).toBe(calculator);

            expect(cmd).toHaveBeenCalledTimes(1);
        });

        it('emits a command event', () => {
            const calculator = engineFactory();
            const cmd = jest.fn().mockImplementation((arg1, arg2) => {
                expect(arg1).toStrictEqual(42);
                expect(arg2).toStrictEqual('bar');
            });
            const commandEvt = jest.fn().mockImplementation((name, arg1, arg2) => {
                expect(name).toStrictEqual('foo');
                expect(arg1).toStrictEqual(42);
                expect(arg2).toStrictEqual('bar');
            });
            const actionEvt = jest.fn().mockImplementation((arg1, arg2) => {
                expect(arg1).toStrictEqual(42);
                expect(arg2).toStrictEqual('bar');
            });

            calculator.setCommand('foo', cmd);
            calculator.setCommand('bar', () => {});
            calculator.on('command', commandEvt);
            calculator.on('command-foo', actionEvt);

            expect(calculator.useCommand('foo', 42, 'bar')).toBe(calculator);

            expect(cmd).toHaveBeenCalledTimes(1);
            expect(commandEvt).toHaveBeenCalledTimes(1);
            expect(actionEvt).toHaveBeenCalledTimes(1);
        });

        it('emits a commanderror event', () => {
            const calculator = engineFactory();
            const errorEvt = jest.fn().mockImplementation(error => {
                expect(error).toEqual(expect.any(TypeError));
                expect(error.message).toStrictEqual('Invalid command: foo');
            });

            calculator.on('commanderror', errorEvt);

            expect(calculator.useCommand('foo', 42, 'bar')).toBe(calculator);

            expect(errorEvt).toHaveBeenCalledTimes(1);
        });
    });

    describe('manages the terms', () => {
        it('adds a term to the expression', () => {
            const calculator = engineFactory();

            expect(calculator.getExpression()).toStrictEqual('');

            expect(calculator.useTerm('NUM6')).toBe(calculator);
            expect(calculator.getExpression()).toStrictEqual('6');
            expect(calculator.getPosition()).toStrictEqual(1);
        });

        it('adds a prefixed term to the expression', () => {
            const calculator = engineFactory();

            expect(calculator.getExpression()).toStrictEqual('');

            expect(calculator.useTerm('@NTHRT')).toBe(calculator);
            expect(calculator.getExpression()).toStrictEqual('@nthrt');
            expect(calculator.getPosition()).toStrictEqual(6);
        });

        it('adds a variable to the expression', () => {
            const calculator = engineFactory();
            calculator.setLastResult('42');

            expect(calculator.getExpression()).toStrictEqual('');

            expect(calculator.useVariable('ans')).toBe(calculator);
            expect(calculator.getExpression()).toStrictEqual('ans');
            expect(calculator.getPosition()).toStrictEqual(3);
        });

        it.each([
            ['it is a 0, and the term to add is not an operator nor a dot', '0', 'NUM1', '1'],
            ['it is the last result, and the term to add is not an operator', 'ans', 'NUM1', '1']
        ])('replaces the expression by the term if %s', (title, expression, term, expected) => {
            const calculator = engineFactory({ expression });

            expect(calculator.useTerm(term)).toBe(calculator);
            expect(calculator.getExpression()).toStrictEqual(expected);
        });

        it.each([
            ['SQRT', 0, '1', 'sqrt 1'],
            ['SQRT', 1, '1', '1 sqrt'],

            ['SQRT', 0, '1+2', 'sqrt 1+2'],
            ['SQRT', 1, '1+2', '1 sqrt+2'],
            ['SQRT', 2, '1+2', '1+sqrt 2'],
            ['SQRT', 3, '1+2', '1+2 sqrt'],

            ['SQRT', 0, 'exp', 'sqrt exp'],
            ['SQRT', 1, 'exp', 'exp sqrt'],
            ['SQRT', 2, 'exp', 'exp sqrt'],
            ['SQRT', 3, 'exp', 'exp sqrt'],

            ['COS', 0, 'exp ln', 'cos exp ln'],
            ['COS', 1, 'exp ln', 'exp cos ln'],
            ['COS', 2, 'exp ln', 'exp cos ln'],
            ['COS', 3, 'exp ln', 'exp cos ln'],
            ['COS', 4, 'exp ln', 'exp cos ln'],
            ['COS', 5, 'exp ln', 'exp ln cos'],
            ['COS', 6, 'exp ln', 'exp ln cos'],

            ['NUM3', 0, 'exp ln', '3 exp ln'],
            ['NUM3', 1, 'exp ln', 'exp 3 ln'],
            ['NUM3', 2, 'exp ln', 'exp 3 ln'],
            ['NUM3', 3, 'exp ln', 'exp 3 ln'],
            ['NUM3', 4, 'exp ln', 'exp 3 ln'],
            ['NUM3', 5, 'exp ln', 'exp ln 3'],
            ['NUM3', 6, 'exp ln', 'exp ln 3'],

            ['ADD', 0, 'exp ln', '+exp ln'],
            ['ADD', 1, 'exp ln', 'exp+ ln'],
            ['ADD', 2, 'exp ln', 'exp+ ln'],
            ['ADD', 3, 'exp ln', 'exp+ ln'],
            ['ADD', 4, 'exp ln', 'exp +ln'],
            ['ADD', 5, 'exp ln', 'exp ln+'],
            ['ADD', 6, 'exp ln', 'exp ln+'],

            ['COS', 0, 'exp 2', 'cos exp 2'],
            ['COS', 1, 'exp 2', 'exp cos 2'],
            ['COS', 2, 'exp 2', 'exp cos 2'],
            ['COS', 3, 'exp 2', 'exp cos 2'],
            ['COS', 4, 'exp 2', 'exp cos 2'],
            ['COS', 5, 'exp 2', 'exp 2 cos'],

            ['NUM3', 0, 'exp 2', '3 exp 2'],
            ['NUM3', 1, 'exp 2', 'exp 3 2'],
            ['NUM3', 2, 'exp 2', 'exp 3 2'],
            ['NUM3', 3, 'exp 2', 'exp 3 2'],
            ['NUM3', 4, 'exp 2', 'exp 32'],
            ['NUM3', 5, 'exp 2', 'exp 23'],

            ['ADD', 0, 'exp 2', '+exp 2'],
            ['ADD', 1, 'exp 2', 'exp+ 2'],
            ['ADD', 2, 'exp 2', 'exp+ 2'],
            ['ADD', 3, 'exp 2', 'exp+ 2'],
            ['ADD', 4, 'exp 2', 'exp +2'],
            ['ADD', 5, 'exp 2', 'exp 2+'],

            ['COS', 0, '2 exp', 'cos 2 exp'],
            ['COS', 1, '2 exp', '2 cos exp'],
            ['COS', 2, '2 exp', '2 cos exp'],
            ['COS', 3, '2 exp', '2 exp cos'],
            ['COS', 4, '2 exp', '2 exp cos'],
            ['COS', 5, '2 exp', '2 exp cos'],

            ['NUM3', 0, '2 exp', '32 exp'],
            ['NUM3', 1, '2 exp', '23 exp'],
            ['NUM3', 2, '2 exp', '2 3 exp'],
            ['NUM3', 3, '2 exp', '2 exp 3'],
            ['NUM3', 4, '2 exp', '2 exp 3'],
            ['NUM3', 5, '2 exp', '2 exp 3'],

            ['ADD', 0, '2 exp', '+2 exp'],
            ['ADD', 1, '2 exp', '2+ exp'],
            ['ADD', 2, '2 exp', '2 +exp'],
            ['ADD', 3, '2 exp', '2 exp+'],
            ['ADD', 4, '2 exp', '2 exp+'],
            ['ADD', 5, '2 exp', '2 exp+'],

            ['ADD', 0, 'exp', '+exp'],
            ['ADD', 1, 'exp', 'exp+'],
            ['ADD', 2, 'exp', 'exp+'],
            ['ADD', 3, 'exp', 'exp+'],

            ['NUM2', 0, 'exp', '2 exp'],
            ['NUM2', 1, 'exp', 'exp 2'],
            ['NUM2', 2, 'exp', 'exp 2'],
            ['NUM2', 3, 'exp', 'exp 2'],

            ['NUM1', 0, '2+exp', '12+exp'],
            ['NUM1', 1, '2+exp', '21+exp'],
            ['NUM1', 2, '2+exp', '2+1 exp'],
            ['NUM1', 3, '2+exp', '2+exp 1'],
            ['NUM1', 4, '2+exp', '2+exp 1'],
            ['NUM1', 5, '2+exp', '2+exp 1'],

            ['NUM1', 0, 'exp+2', '1 exp+2'],
            ['NUM1', 1, 'exp+2', 'exp 1+2'],
            ['NUM1', 2, 'exp+2', 'exp 1+2'],
            ['NUM1', 3, 'exp+2', 'exp 1+2'],
            ['NUM1', 4, 'exp+2', 'exp+12'],
            ['NUM1', 5, 'exp+2', 'exp+21']
        ])('inserts %s at %s in %s', (term, position, expression, expected) => {
            const calculator = engineFactory({ expression, position });
            calculator.setLastResult('42');

            expect(calculator.useTerm(term)).toBe(calculator);
            expect(calculator.getExpression()).toStrictEqual(expected);
        });

        it('emits a termadd event', () => {
            const calculator = engineFactory();
            const term = {
                name: 'foo',
                value: 'foo',
                type: 'term'
            };
            const termEvt = jest.fn().mockImplementation((name, addedTerm) => {
                expect(name).toStrictEqual(term.name);
                expect(addedTerm).toBe(term);
            });

            calculator.on('termadd', termEvt);

            expect(calculator.addTerm('foo', term)).toBe(calculator);

            expect(termEvt).toHaveBeenCalledTimes(1);
        });

        it('emits a termerror event when an invalid term is used', () => {
            const calculator = engineFactory();
            const errorEvt = jest.fn().mockImplementation(error => {
                expect(error).toEqual(expect.any(TypeError));
                expect(error.message).toStrictEqual('Invalid term: foo');
            });

            calculator.on('termerror', errorEvt);

            expect(calculator.addTerm('foo')).toBe(calculator);
            expect(calculator.addTerm('foo', {})).toBe(calculator);

            expect(errorEvt).toHaveBeenCalledTimes(2);
        });

        it('emits a termerror event when an unknown term is used', () => {
            const calculator = engineFactory();
            const errorEvt = jest.fn().mockImplementation(error => {
                expect(error).toEqual(expect.any(TypeError));
                expect(error.message).toStrictEqual('Invalid term: foo');
            });

            calculator.on('termerror', errorEvt);

            expect(calculator.useTerm('foo')).toBe(calculator);

            expect(errorEvt).toHaveBeenCalledTimes(1);
        });

        it('emits a termerror event when an unknown variable is used', () => {
            const calculator = engineFactory();
            const errorEvt = jest.fn().mockImplementation(error => {
                expect(error).toEqual(expect.any(TypeError));
                expect(error.message).toStrictEqual('Invalid variable: foo');
            });

            calculator.on('termerror', errorEvt);

            expect(calculator.useVariable('foo')).toBe(calculator);

            expect(errorEvt).toHaveBeenCalledTimes(1);
        });

        it.each([
            [['NUM1', 'ADD', 'NUM2'], '1+2'],
            ['NUM1 ADD NUM2', '1+2']
        ])('adds a list of terms to the expression from %s', (terms, expected) => {
            const calculator = engineFactory();

            expect(calculator.getExpression()).toStrictEqual('');

            expect(calculator.useTerms(terms)).toBe(calculator);
            expect(calculator.getExpression()).toStrictEqual(expected);
            expect(calculator.getPosition()).toStrictEqual(3);
        });
    });

    describe('evaluates the expression', () => {
        it('from an empty expression', () => {
            const calculator = engineFactory();

            expect(calculator.evaluate()).toMatchSnapshot();
        });

        it('from a simple expression', () => {
            const calculator = engineFactory({ expression: '.1 + .2' });

            expect(calculator.evaluate()).toMatchSnapshot();
        });

        it('using the last result', () => {
            const calculator = engineFactory({ expression: 'ans / 2' });
            calculator.setLastResult('42');

            expect(calculator.evaluate()).toMatchSnapshot();
        });

        it('emits an evaluate event', () => {
            const calculator = engineFactory({ expression: '.1 + .2' });
            const action = jest.fn().mockImplementation(result => {
                expect(result).toMatchSnapshot();
            });

            calculator.on('evaluate', action);
            calculator.evaluate();

            expect(action).toHaveBeenCalledTimes(1);
        });

        it('emits a syntaxerror event', () => {
            const calculator = engineFactory({ expression: '3 *' });
            const action = jest.fn().mockImplementation(error => {
                expect(String(error)).toStrictEqual('Error: unexpected TEOF: EOF');
            });

            calculator.on('syntaxerror', action);
            calculator.evaluate();

            expect(action).toHaveBeenCalledTimes(1);
        });
    });

    describe('renders the expression', () => {
        it('from an empty expression', () => {
            const calculator = engineFactory();

            expect(calculator.render()).toStrictEqual([]);
        });

        it('from a simple expression', () => {
            const calculator = engineFactory({ expression: '.1 + .2' });

            expect(calculator.render()).toMatchSnapshot();
        });

        it('using the last result', () => {
            const calculator = engineFactory({ expression: 'ans / 2' });
            calculator.setLastResult('42');

            expect(calculator.render()).toMatchSnapshot();
        });

        it('emits a render event', () => {
            const calculator = engineFactory({ expression: '.1 + .2' });
            const action = jest.fn().mockImplementation(result => {
                expect(result).toMatchSnapshot();
            });

            calculator.on('render', action);
            calculator.render();

            expect(action).toHaveBeenCalledTimes(1);
        });
    });
});
