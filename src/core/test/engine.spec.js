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

import Decimal from 'decimal.js';
import engineFactory from '../engine.js';

describe('engine', () => {
    it('is a factory', () => {
        expect(engineFactory).toEqual(expect.any(Function));
        expect(engineFactory()).toEqual(expect.any(Object));
        expect(engineFactory()).not.toStrictEqual(engineFactory());
    });

    describe('manages events', () => {
        it('registers an event listener', () => {
            const calculator = engineFactory();
            const action = jest.fn();

            expect(calculator.on('test', action)).toBe(calculator);

            calculator.trigger('test');

            expect(action).toHaveBeenCalledTimes(1);
        });

        it('registers multiple events to one listener', () => {
            const calculator = engineFactory();
            const action = jest.fn();

            expect(calculator.on('foo bar', action)).toBe(calculator);

            calculator.trigger('foo');
            calculator.trigger('bar');

            expect(action).toHaveBeenCalledTimes(2);
        });

        it('removes an event listener', () => {
            const calculator = engineFactory();
            const action1 = jest.fn();
            const action2 = jest.fn();

            calculator.on('test', action1);
            calculator.on('test', action2);
            calculator.on('', action2);

            expect(calculator.off('test', action1)).toBe(calculator);

            calculator.trigger('test');

            expect(action1).toHaveBeenCalledTimes(0);
            expect(action2).toHaveBeenCalledTimes(1);
        });

        it('removes a listener from multiple events', () => {
            const calculator = engineFactory();
            const action1 = jest.fn();
            const action2 = jest.fn();

            calculator.on('foo', action1);
            calculator.on('bar', action1);
            calculator.on('test', action2);

            expect(calculator.off('foo bar', action1)).toBe(calculator);

            calculator.trigger('foo');
            calculator.trigger('bar');
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
    });

    describe('manages the evaluator', () => {
        it('access the evaluator', () => {
            const calculator = engineFactory();

            expect(calculator.getMathsEvaluator()).toEqual(expect.any(Function));
        });

        it('configure the evaluator', () => {
            const expression = 'cos PI';
            const calculator = engineFactory({ expression });
            const evaluator = calculator.getMathsEvaluator();

            expect(calculator.evaluate().value).toEqual(-1);
            expect(calculator.configureMathsEvaluator({ degree: true })).toBe(calculator);
            expect(calculator.getMathsEvaluator()).not.toBe(evaluator);
            expect(calculator.evaluate().value).toEqual(0.9984971498638638);
        });

        it('emits a configure event', () => {
            const calculator = engineFactory();
            const config = { degree: true };
            const action = jest.fn().mockImplementation(conf => {
                expect(conf).toBe(config);
            });

            calculator.on('configure', action);
            calculator.configureMathsEvaluator(config);

            expect(action).toHaveBeenCalledTimes(1);
        });

        it('set the degree mode', () => {
            const expression = 'cos PI';
            const calculator = engineFactory({ expression });

            expect(calculator.isDegreeMode()).toBeFalsy();
            expect(calculator.evaluate().value).toEqual(-1);

            expect(calculator.setDegreeMode()).toBe(calculator);
            expect(calculator.isDegreeMode()).toBeTruthy();
            expect(calculator.evaluate().value).toEqual(0.9984971498638638);

            expect(calculator.setDegreeMode(false)).toBe(calculator);
            expect(calculator.isDegreeMode()).toBeFalsy();
            expect(calculator.evaluate().value).toEqual(-1);

            expect(calculator.setDegreeMode(true)).toBe(calculator);
            expect(calculator.isDegreeMode()).toBeTruthy();
            expect(calculator.evaluate().value).toEqual(0.9984971498638638);
        });
    });

    describe('manages the expression', () => {
        it('initializes with the expression', () => {
            const calculator = engineFactory({ expression: '1+2' });

            expect(calculator.getExpression()).toStrictEqual('1+2');
            expect(calculator.getPosition()).toStrictEqual(3);
        });

        it('sets the expression', () => {
            const calculator = engineFactory();

            expect(calculator.getExpression()).toStrictEqual('');
            expect(calculator.setExpression('1+2')).toBe(calculator);
            expect(calculator.getExpression()).toStrictEqual('1+2');
        });

        it('emits an expression event', () => {
            const calculator = engineFactory();
            const expression = '(1 + 2) * 3';
            const action = jest.fn().mockImplementation(expr => {
                expect(expr).toStrictEqual(expression);
            });

            calculator.on('expression', action);
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
            expect(calculator.getPosition()).toStrictEqual(3);
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

        it('initializes with the position', () => {
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

        it('emits a position event', () => {
            const expression = '(1 + 2) * 3';
            const calculator = engineFactory({ expression });
            const action = jest.fn().mockImplementation(position => {
                expect(position).toStrictEqual(2);
            });

            calculator.on('position', action);
            calculator.setPosition(2);

            expect(action).toHaveBeenCalledTimes(1);
        });

        it.each([
            ['', 0, 0],
            ['(5-2)*4/5', 0, 0],
            ['(5-2)*4/5', 5, 4],
            ['(5-2)*4/5', 9, 8],
            ['3*cos PI-2', 5, 2],
            ['3*cos PI-2', 3, 2],
            ['3*cos PI-2', 2, 1],
            ['cos PI-2', 1, 0],
            [' cos PI-2', 1, 0]
        ])('moves to the left in %s fom position %s', (expression, position, expected) => {
            const calculator = engineFactory({ expression, position });
            expect(calculator.movePositionLeft()).toBe(calculator);
            expect(calculator.getPosition()).toEqual(expected);
        });

        it.each([
            ['', 0, 0],
            ['(5-2)*4/5', 0, 1],
            ['(5-2)*4/5', 5, 6],
            ['(5-2)*4/5', 8, 9],
            ['(5-2)*4/5', 9, 9],
            ['3*cos PI-2', 5, 6],
            ['3*cos PI-2', 3, 6],
            ['3*cos PI-2', 2, 6],
            ['cos PI-2', 1, 4]
        ])('moves to the right in %s fom position %s', (expression, position, expected) => {
            const calculator = engineFactory({ expression, position });
            expect(calculator.movePositionRight()).toBe(calculator);
            expect(calculator.getPosition()).toEqual(expected);
        });

        it.each([
            ['', 0, '', 0],
            ['cos', 1, '', 0],
            [' cos', 1, ' ', 1],
            ['(5-2)*4/5', 0, '(5-2)*4/5', 0],
            ['(5-2)*4/5', 1, '5-2)*4/5', 0],
            ['(5-2)*4/5', 9, '(5-2)*4/', 8],
            ['3*cos PI-2', 5, '3*PI-2', 2]
        ])(
            'deletes on the left in %s fom position %s',
            (expression, position, expectedExpression, expectedPosition) => {
                const calculator = engineFactory({ expression, position });
                expect(calculator.deleteTokenLeft()).toBe(calculator);
                expect(calculator.getExpression()).toEqual(expectedExpression);
                expect(calculator.getPosition()).toEqual(expectedPosition);
            }
        );

        it.each([
            ['', 0, '', 0],
            ['(5-2)*4/5', 0, '5-2)*4/5', 0],
            ['(5-2)*4/5', 1, '(-2)*4/5', 1],
            ['(5-2)*4/5', 8, '(5-2)*4/', 8],
            ['(5-2)*4/5', 9, '(5-2)*4/5', 9],
            ['3*cos PI-2', 3, '3*PI-2', 2],
            ['3*cos PI-2', 5, '3*cos -2', 5]
        ])(
            'deletes on the right in %s fom position %s',
            (expression, position, expectedExpression, expectedPosition) => {
                const calculator = engineFactory({ expression, position });
                expect(calculator.deleteTokenRight()).toBe(calculator);
                expect(calculator.getExpression()).toEqual(expectedExpression);
                expect(calculator.getPosition()).toEqual(expectedPosition);
            }
        );
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

        it('removes a token', () => {
            const calculator = engineFactory({ expression: '(1 + 2) * 3', position: 2 });

            expect(calculator.deleteToken(calculator.getTokens()[1])).toBe(calculator);
            expect(calculator.getExpression()).toEqual('(+ 2) * 3');
            expect(calculator.getPosition()).toEqual(1);

            calculator.setPosition(4);
            expect(calculator.deleteToken(calculator.getTokens()[1])).toBe(calculator);
            expect(calculator.getExpression()).toEqual('(2) * 3');
            expect(calculator.getPosition()).toEqual(2);

            expect(calculator.deleteToken(calculator.getTokens()[4])).toBe(calculator);
            expect(calculator.getExpression()).toEqual('(2) * ');
            expect(calculator.getPosition()).toEqual(2);

            expect(calculator.deleteToken()).toBe(calculator);
            expect(calculator.getExpression()).toEqual('(2) * ');
            expect(calculator.getPosition()).toEqual(2);
        });
    });

    describe('manages the variables', () => {
        it('initializes with a list of variables', () => {
            const calculator = engineFactory({ variables: { ans: -3, mem: 10, foo: 42, expr: '4*3' } });

            expect(calculator.getVariable('foo')).toMatchSnapshot();
            expect(calculator.getVariable('expr')).toMatchSnapshot();
            expect(calculator.getAllVariables()).toMatchSnapshot();
        });

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

        it('emits a variableadd event', () => {
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

        it('emits a variabledelete event', () => {
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
            expect(calculator.getAllVariables()).toMatchSnapshot();
        });

        it('gets variable values', () => {
            const calculator = engineFactory();

            calculator.setVariable('foo', 42);
            calculator.setVariable('expr', '4*3');

            expect(calculator.getVariableValue('foo')).toStrictEqual(42);
            expect(calculator.getVariableValue('bar')).toStrictEqual(0);
            expect(calculator.getVariableValue('expr')).toBeInstanceOf(Decimal);
            expect(calculator.getVariableValue('expr').toString()).toStrictEqual('12');
            expect(calculator.getAllVariableValues()).toMatchSnapshot();
        });

        it('sets variables from a list', () => {
            const calculator = engineFactory();

            expect(calculator.setVariableList({ foo: 42, expr: '4*3' })).toBe(calculator);

            expect(calculator.getVariable('foo')).toMatchSnapshot();
            expect(calculator.getVariable('expr')).toMatchSnapshot();
            expect(calculator.getAllVariables()).toMatchSnapshot();
        });

        it('deletes all variables', () => {
            const calculator = engineFactory();
            const action = jest.fn();

            calculator.on('variableclear', action);
            calculator.setVariable('foo', 42);
            calculator.setVariable('expr', '4*3');

            expect(calculator.hasVariable('ans')).toBeTruthy();
            expect(calculator.hasVariable('mem')).toBeTruthy();
            expect(calculator.hasVariable('foo')).toBeTruthy();
            expect(calculator.hasVariable('expr')).toBeTruthy();

            expect(calculator.clearVariables()).toBe(calculator);
            expect(calculator.hasVariable('ans')).toBeTruthy();
            expect(calculator.hasVariable('mem')).toBeTruthy();
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

    describe('manages a memory', () => {
        it('set the memory from last result', () => {
            const calculator = engineFactory();

            expect(calculator.getMemory()).toMatchSnapshot();

            calculator.setLastResult(42);
            expect(calculator.setMemory()).toBe(calculator);
            expect(calculator.getMemory()).toMatchSnapshot();
        });

        it('clears the memory', () => {
            const calculator = engineFactory();

            calculator.setLastResult(42);
            calculator.setMemory();

            expect(calculator.getMemory()).toMatchSnapshot();
            expect(calculator.clearMemory()).toBe(calculator);
            expect(calculator.getMemory()).toMatchSnapshot();
        });
    });

    describe('manages the commands', () => {
        it('initializes with a list of commands', () => {
            const commands = {
                foo() {},
                bar() {}
            };
            const calculator = engineFactory({ commands });

            expect(calculator.getAllCommands()).toMatchSnapshot();
        });

        it('sets a command', () => {
            const calculator = engineFactory();
            const cmd = () => {};

            expect(calculator.hasCommand('foo')).toBeFalsy();

            expect(calculator.setCommand('foo', cmd)).toBe(calculator);
            expect(calculator.hasCommand('foo')).toBeTruthy();
            expect(calculator.getCommand('foo')).toBe(cmd);
        });

        it('emits a commandadd event', () => {
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

        it('emits a commanddelete event', () => {
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
            expect(calculator.getAllCommands()).toMatchSnapshot();
        });

        it('sets commands from a list', () => {
            const calculator = engineFactory();
            const cmds = {
                foo() {},
                bar() {}
            };

            expect(calculator.setCommandList(cmds)).toBe(calculator);

            expect(calculator.getCommand('foo')).toBe(cmds.foo);
            expect(calculator.getCommand('bar')).toBe(cmds.bar);
            expect(calculator.getAllCommands()).toMatchSnapshot();
        });

        it('deletes all commands', () => {
            const calculator = engineFactory();
            const cmd1 = () => {};
            const cmd2 = () => {};
            const action = jest.fn();

            calculator.on('commandclear', action);
            calculator.setCommand('foo', cmd1);
            calculator.setCommand('bar', cmd2);

            expect(calculator.hasCommand('foo')).toBeTruthy();
            expect(calculator.hasCommand('bar')).toBeTruthy();

            expect(calculator.clearCommands()).toBe(calculator);
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

            expect(calculator.invoke('foo', 42, 'bar')).toBe(calculator);

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

            expect(calculator.invoke('foo', 42, 'bar')).toBe(calculator);

            expect(cmd).toHaveBeenCalledTimes(1);
            expect(commandEvt).toHaveBeenCalledTimes(1);
            expect(actionEvt).toHaveBeenCalledTimes(1);
        });

        it('emits an error event', () => {
            const calculator = engineFactory();
            const errorEvt = jest.fn().mockImplementation(error => {
                expect(error).toEqual(expect.any(TypeError));
                expect(error.message).toStrictEqual('Invalid command: foo');
            });

            calculator.on('error', errorEvt);

            expect(calculator.invoke('foo', 42, 'bar')).toBe(calculator);

            expect(errorEvt).toHaveBeenCalledTimes(1);
        });
    });

    describe('manages the plugins', () => {
        it('initializes with a list of plugins', () => {
            const plugins = {
                foo: jest.fn(),
                bar: jest.fn()
            };
            const calculator = engineFactory({ plugins });

            expect(calculator.hasPlugin('foo')).toBeTruthy();
            expect(calculator.hasPlugin('bar')).toBeTruthy();
            expect(calculator.hasPlugin('baz')).toBeFalsy();

            expect(plugins.foo).toBeCalledTimes(1);
            expect(plugins.bar).toBeCalledTimes(1);
        });

        it('adds a plugin', () => {
            const calculator = engineFactory();
            const plugin = jest.fn().mockImplementation(calc => {
                expect(calc).toBe(calculator);
            });

            expect(calculator.addPlugin('foo', plugin)).toBe(calculator);
            expect(calculator.hasPlugin('foo')).toBeTruthy();
            expect(plugin).toHaveBeenCalledTimes(1);
        });

        it('adds a plugin again', () => {
            const calculator = engineFactory();
            const uninstall = jest.fn();
            const plugin = jest.fn().mockImplementation(calc => {
                expect(calc).toBe(calculator);
                return uninstall;
            });

            calculator.addPlugin('foo', plugin);
            calculator.addPlugin('foo', plugin);

            expect(calculator.hasPlugin('foo')).toBeTruthy();
            expect(plugin).toHaveBeenCalledTimes(2);
            expect(uninstall).toHaveBeenCalledTimes(1);
        });

        it('emits a pluginadd event', () => {
            const calculator = engineFactory();
            const plugin = jest.fn().mockImplementation(calc => {
                expect(calc).toBe(calculator);
            });
            const event = jest.fn().mockImplementation(name => {
                expect(name).toStrictEqual('foo');
            });

            calculator.on('pluginadd', event);
            calculator.addPlugin('foo', plugin);

            expect(plugin).toHaveBeenCalledTimes(1);
            expect(event).toHaveBeenCalledTimes(1);
        });

        it('deletes a plugin', () => {
            const calculator = engineFactory();
            const uninstall = jest.fn();
            const plugin = jest.fn().mockImplementation(() => uninstall);

            expect(calculator.hasPlugin('foo')).toBeFalsy();

            calculator.addPlugin('foo', plugin);
            expect(calculator.hasPlugin('foo')).toBeTruthy();

            expect(calculator.removePlugin('foo')).toBe(calculator);
            expect(calculator.hasPlugin('foo')).toBeFalsy();

            expect(plugin).toHaveBeenCalledTimes(1);
            expect(uninstall).toHaveBeenCalledTimes(1);
        });

        it('emits a plugindelete event', () => {
            const calculator = engineFactory();
            const plugin = jest.fn();
            const event = jest.fn().mockImplementation(name => {
                expect(name).toStrictEqual('foo');
            });

            calculator.addPlugin('foo', plugin);
            calculator.on('plugindelete', event);
            calculator.removePlugin('foo');

            expect(plugin).toHaveBeenCalledTimes(1);
            expect(event).toHaveBeenCalledTimes(1);
        });

        it('installs plugins from a list', () => {
            const calculator = engineFactory();
            const plugins = {
                foo: jest.fn(),
                bar: jest.fn()
            };

            expect(calculator.hasPlugin('foo')).toBeFalsy();
            expect(calculator.hasPlugin('bar')).toBeFalsy();

            expect(calculator.addPluginList(plugins)).toBe(calculator);

            expect(calculator.hasPlugin('foo')).toBeTruthy();
            expect(calculator.hasPlugin('bar')).toBeTruthy();
            expect(calculator.hasPlugin('baz')).toBeFalsy();

            expect(plugins.foo).toBeCalledTimes(1);
            expect(plugins.bar).toBeCalledTimes(1);
        });

        it('uninstalls all plugins', () => {
            const uninstallFoo = jest.fn();
            const uninstallBar = jest.fn();
            const plugins = {
                foo: jest.fn().mockImplementation(() => uninstallFoo),
                bar: jest.fn().mockImplementation(() => uninstallBar)
            };
            const calculator = engineFactory({ plugins });
            const event = jest.fn();

            expect(calculator.hasPlugin('foo')).toBeTruthy();
            expect(calculator.hasPlugin('bar')).toBeTruthy();

            expect(plugins.foo).toBeCalledTimes(1);
            expect(plugins.bar).toBeCalledTimes(1);

            calculator.on('pluginclear', event);

            expect(calculator.clearPlugins()).toBe(calculator);
            expect(calculator.hasPlugin('foo')).toBeFalsy();
            expect(calculator.hasPlugin('bar')).toBeFalsy();

            expect(event).toHaveBeenCalledTimes(1);
            expect(uninstallFoo).toHaveBeenCalledTimes(1);
            expect(uninstallBar).toHaveBeenCalledTimes(1);
        });
    });

    describe('manages the terms', () => {
        it('adds a term to the expression', () => {
            const calculator = engineFactory();

            expect(calculator.getExpression()).toStrictEqual('');

            expect(calculator.insertTerm('NUM6')).toBe(calculator);
            expect(calculator.getExpression()).toStrictEqual('6');
            expect(calculator.getPosition()).toStrictEqual(1);
        });

        it('adds a prefixed term to the expression', () => {
            const calculator = engineFactory();

            expect(calculator.getExpression()).toStrictEqual('');

            expect(calculator.insertTerm('@NTHRT')).toBe(calculator);
            expect(calculator.getExpression()).toStrictEqual('@nthrt');
            expect(calculator.getPosition()).toStrictEqual(6);
        });

        it('adds a variable to the expression', () => {
            const calculator = engineFactory();
            calculator.setLastResult('42');

            expect(calculator.getExpression()).toStrictEqual('');

            expect(calculator.insertVariable('ans')).toBe(calculator);
            expect(calculator.getExpression()).toStrictEqual('ans');
            expect(calculator.getPosition()).toStrictEqual(3);
        });

        it.each([
            ['it is a 0, and the term to add is not an operator nor a dot', '0', 'NUM1', '1'],
            ['it is the last result, and the term to add is not an operator', 'ans', 'NUM1', '1']
        ])('replaces the expression by the term if %s', (title, expression, term, expected) => {
            const calculator = engineFactory({ expression });

            expect(calculator.insertTerm(term)).toBe(calculator);
            expect(calculator.getExpression()).toStrictEqual(expected);
        });

        it.each([
            ['SQRT', 0, '1', 'sqrt 1'],
            ['SQRT', 1, '1', '1*sqrt'],

            ['SQRT', 0, '(', 'sqrt('],
            ['SQRT', 1, '(', '(sqrt'],
            ['SQRT', 0, ')', 'sqrt)'],
            ['SQRT', 1, ')', ')*sqrt'],

            ['NUM1', 0, '(', '1*('],
            ['NUM1', 1, '(', '(1'],
            ['NUM1', 0, ')', '1)'],
            ['NUM1', 1, ')', ')*1'],

            ['LPAR', 0, ')', '()'],
            ['LPAR', 1, ')', ')*('],

            ['LPAR', 0, 'PI', '(PI'],
            ['LPAR', 1, 'PI', 'PI*('],
            ['LPAR', 2, 'PI', 'PI*('],

            ['LPAR', 0, '2', '(2'],
            ['LPAR', 1, '2', '2*('],

            ['RPAR', 0, '(', ')*('],
            ['RPAR', 1, '(', '()'],

            ['RPAR', 0, '3', ')*3'],
            ['RPAR', 1, '3', '3)'],

            ['RPAR', 0, 'ln', ')*ln'],
            ['RPAR', 1, 'ln', 'ln)'],
            ['RPAR', 2, 'ln', 'ln)'],

            ['TEN', 0, '5', 'TEN*5'],
            ['TEN', 1, '5', '5*TEN'],

            ['TEN', 0, '+', 'TEN+'],
            ['TEN', 1, '+', '+TEN'],

            ['TEN', 0, 'exp', 'TEN*exp'],
            ['TEN', 1, 'exp', 'exp TEN'],
            ['TEN', 2, 'exp', 'exp TEN'],
            ['TEN', 3, 'exp', 'exp TEN'],

            ['@NTHRT', 0, '1+2', '@nthrt 1+2'],
            ['@NTHRT', 1, '1+2', '1@nthrt+2'],
            ['@NTHRT', 2, '1+2', '1+@nthrt 2'],
            ['@NTHRT', 3, '1+2', '1+2@nthrt'],

            ['SQRT', 0, '1+2', 'sqrt 1+2'],
            ['SQRT', 1, '1+2', '1*sqrt+2'],
            ['SQRT', 2, '1+2', '1+sqrt 2'],
            ['SQRT', 3, '1+2', '1+2*sqrt'],

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

            ['NUM3', 0, 'PI', '3*PI'],
            ['NUM3', 1, 'PI', 'PI*3'],
            ['NUM3', 2, 'PI', 'PI*3'],

            ['NUM3', 0, 'exp ln', '3*exp ln'],
            ['NUM3', 1, 'exp ln', 'exp 3* ln'],
            ['NUM3', 2, 'exp ln', 'exp 3* ln'],
            ['NUM3', 3, 'exp ln', 'exp 3* ln'],
            ['NUM3', 4, 'exp ln', 'exp 3*ln'],
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
            ['COS', 5, 'exp 2', 'exp 2*cos'],

            ['NUM3', 0, 'exp 2', '3*exp 2'],
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

            ['COS', 0, '2*exp', 'cos 2*exp'],
            ['COS', 1, '2*exp', '2*cos*exp'],
            ['COS', 2, '2*exp', '2*cos exp'],
            ['COS', 3, '2*exp', '2*exp cos'],
            ['COS', 4, '2*exp', '2*exp cos'],
            ['COS', 5, '2*exp', '2*exp cos'],

            ['NUM3', 0, '2*exp', '32*exp'],
            ['NUM3', 1, '2*exp', '23*exp'],
            ['NUM3', 2, '2*exp', '2*3*exp'],
            ['NUM3', 3, '2*exp', '2*exp 3'],
            ['NUM3', 4, '2*exp', '2*exp 3'],
            ['NUM3', 5, '2*exp', '2*exp 3'],

            ['ADD', 0, '2*exp', '+2*exp'],
            ['ADD', 1, '2*exp', '2+*exp'],
            ['ADD', 2, '2*exp', '2*+exp'],
            ['ADD', 3, '2*exp', '2*exp+'],
            ['ADD', 4, '2*exp', '2*exp+'],
            ['ADD', 5, '2*exp', '2*exp+'],

            ['ADD', 0, 'exp', '+exp'],
            ['ADD', 1, 'exp', 'exp+'],
            ['ADD', 2, 'exp', 'exp+'],
            ['ADD', 3, 'exp', 'exp+'],

            ['NUM2', 0, 'exp', '2*exp'],
            ['NUM2', 1, 'exp', 'exp 2'],
            ['NUM2', 2, 'exp', 'exp 2'],
            ['NUM2', 3, 'exp', 'exp 2'],

            ['NUM1', 0, '2+exp', '12+exp'],
            ['NUM1', 1, '2+exp', '21+exp'],
            ['NUM1', 2, '2+exp', '2+1*exp'],
            ['NUM1', 3, '2+exp', '2+exp 1'],
            ['NUM1', 4, '2+exp', '2+exp 1'],
            ['NUM1', 5, '2+exp', '2+exp 1'],

            ['NUM1', 0, 'exp+2', '1*exp+2'],
            ['NUM1', 1, 'exp+2', 'exp 1+2'],
            ['NUM1', 2, 'exp+2', 'exp 1+2'],
            ['NUM1', 3, 'exp+2', 'exp 1+2'],
            ['NUM1', 4, 'exp+2', 'exp+12'],
            ['NUM1', 5, 'exp+2', 'exp+21']
        ])('inserts %s at %s in %s', (term, position, expression, expected) => {
            const calculator = engineFactory({ expression, position });
            calculator.setLastResult('42');

            expect(calculator.insertTerm(term)).toBe(calculator);
            expect(calculator.getExpression()).toStrictEqual(expected);
        });

        it.each([
            ['', 0, ''],
            ['1', 0, '-1'],
            ['1', 1, '-1'],
            ['-1', 0, '1'],
            ['-1', 1, '1'],
            ['-1', 2, '1'],
            ['3*2', 3, '3*-2'],
            ['3*-2', 4, '3*2'],
            ['3*(5-2)', 5, '3*(5+2)'],
            ['3*(5-2)', 6, '3*-(5-2)'],
            ['3*(5-2)', 7, '3*-(5-2)'],
            ['cos', 0, '-cos'],
            ['cos 2', 0, '-cos 2'],
            ['cos 2', 5, 'cos -2'],
            ['PI', 0, '-PI']
        ])('change the sign in %s at %s', (expression, position, expected) => {
            const calculator = engineFactory({ expression, position });

            expect(calculator.changeSign()).toBe(calculator);
            expect(calculator.getExpression()).toStrictEqual(expected);
        });

        it('emits a term event', () => {
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

            calculator.on('term', termEvt);

            expect(calculator.addTerm('foo', term)).toBe(calculator);

            expect(termEvt).toHaveBeenCalledTimes(1);
        });

        it('emits an error event when an invalid term is used', () => {
            const calculator = engineFactory();
            const errorEvt = jest.fn().mockImplementation(error => {
                expect(error).toEqual(expect.any(TypeError));
                expect(error.message).toStrictEqual('Invalid term: foo');
            });

            calculator.on('error', errorEvt);

            expect(calculator.addTerm('foo')).toBe(calculator);
            expect(calculator.addTerm('foo', {})).toBe(calculator);

            expect(errorEvt).toHaveBeenCalledTimes(2);
        });

        it('emits an error event when an unknown term is used', () => {
            const calculator = engineFactory();
            const errorEvt = jest.fn().mockImplementation(error => {
                expect(error).toEqual(expect.any(TypeError));
                expect(error.message).toStrictEqual('Invalid term: foo');
            });

            calculator.on('error', errorEvt);

            expect(calculator.insertTerm('foo')).toBe(calculator);

            expect(errorEvt).toHaveBeenCalledTimes(1);
        });

        it('emits an error event when an unknown variable is used', () => {
            const calculator = engineFactory();
            const errorEvt = jest.fn().mockImplementation(error => {
                expect(error).toEqual(expect.any(TypeError));
                expect(error.message).toStrictEqual('Invalid variable: foo');
            });

            calculator.on('error', errorEvt);

            expect(calculator.insertVariable('foo')).toBe(calculator);

            expect(errorEvt).toHaveBeenCalledTimes(1);
        });

        it.each([
            [['NUM1', 'ADD', 'NUM2'], '1+2'],
            ['NUM1 ADD NUM2', '1+2']
        ])('adds a list of terms to the expression from %s', (terms, expected) => {
            const calculator = engineFactory();

            expect(calculator.getExpression()).toStrictEqual('');

            expect(calculator.insertTermList(terms)).toBe(calculator);
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

        it('set the last result', () => {
            const calculator = engineFactory({ expression: '.1 + .2' });

            calculator.evaluate();

            expect(calculator.getLastResult()).toMatchSnapshot();
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

    it('resets the calculator', () => {
        const variables = { x: '42' };
        const calculator = engineFactory({ expression: '1+2', position: 2 });
        const action = jest.fn();

        calculator.setVariableList(variables);
        calculator.setLastResult(2);
        calculator.setMemory();
        calculator.setLastResult(10);
        calculator.on('reset', action);

        expect(calculator.getVariableValue('ans')).toStrictEqual(10);
        expect(calculator.getVariableValue('mem')).toStrictEqual(2);
        expect(calculator.getVariableValue('x')).toStrictEqual(42);
        expect(calculator.getExpression()).toStrictEqual('1+2');
        expect(calculator.getPosition()).toStrictEqual(2);

        expect(calculator.reset()).toBe(calculator);
        expect(calculator.getVariableValue('ans')).toStrictEqual(0);
        expect(calculator.getVariableValue('mem')).toStrictEqual(0);
        expect(calculator.hasVariable('x')).toBeFalsy();
        expect(calculator.getExpression()).toStrictEqual('');
        expect(calculator.getPosition()).toStrictEqual(0);
        expect(action).toHaveBeenCalledTimes(1);
    });

    describe('has built-in command', () => {
        it('clear', () => {
            const expression = '.1 + .2';
            const position = 2;
            const variables = { x: '42' };
            const calculator = engineFactory({ expression, position });
            const clearEvent = jest.fn();
            const clearCommand = jest.fn();

            calculator.setVariableList(variables);
            calculator.setLastResult(2);
            calculator.setMemory();
            calculator.setLastResult(10);
            calculator.on('clear', clearEvent);
            calculator.on('command-clear', clearCommand);

            expect(calculator.getExpression()).toStrictEqual(expression);
            expect(calculator.getPosition()).toStrictEqual(position);
            expect(calculator.getVariableValue('ans')).toStrictEqual(10);
            expect(calculator.getVariableValue('mem')).toStrictEqual(2);
            expect(calculator.getVariableValue('x')).toStrictEqual(42);

            calculator.invoke('clear');

            expect(calculator.getExpression()).toStrictEqual('');
            expect(calculator.getPosition()).toStrictEqual(0);
            expect(calculator.getVariableValue('ans')).toStrictEqual(10);
            expect(calculator.getVariableValue('mem')).toStrictEqual(2);
            expect(calculator.getVariableValue('x')).toStrictEqual(42);
            expect(clearEvent).toHaveBeenCalledTimes(1);
            expect(clearCommand).toHaveBeenCalledTimes(1);
        });

        it('reset', () => {
            const expression = '.1 + .2';
            const position = 2;
            const variables = { x: '42' };
            const calculator = engineFactory({ expression, position });
            const resetEvent = jest.fn();
            const clearCommand = jest.fn();

            calculator.setVariableList(variables);
            calculator.setLastResult(2);
            calculator.setMemory();
            calculator.setLastResult(10);
            calculator.on('reset', resetEvent);
            calculator.on('command-reset', clearCommand);

            expect(calculator.getExpression()).toStrictEqual(expression);
            expect(calculator.getPosition()).toStrictEqual(position);
            expect(calculator.getVariableValue('ans')).toStrictEqual(10);
            expect(calculator.getVariableValue('mem')).toStrictEqual(2);
            expect(calculator.getVariableValue('x')).toStrictEqual(42);

            calculator.invoke('reset');

            expect(calculator.getExpression()).toStrictEqual('');
            expect(calculator.getPosition()).toStrictEqual(0);
            expect(calculator.getVariableValue('ans')).toStrictEqual(0);
            expect(calculator.getVariableValue('mem')).toStrictEqual(0);
            expect(calculator.hasVariable('x')).toBeFalsy();
            expect(resetEvent).toHaveBeenCalledTimes(1);
            expect(clearCommand).toHaveBeenCalledTimes(1);
        });

        it('execute', () => {
            const expression = '3 * x';
            const position = 2;
            const variables = { x: '42' };
            const calculator = engineFactory({ expression, position });
            const evaluateEvent = jest.fn().mockImplementation(result => {
                expect(result).toBe(calculator.getLastResult());
            });
            const executeCommand = jest.fn();

            calculator.setVariableList(variables);
            calculator.on('evaluate', evaluateEvent);
            calculator.on('command-execute', executeCommand);
            calculator.invoke('execute');

            expect(calculator.getVariableValue('ans').toString()).toEqual('126');
            expect(evaluateEvent).toHaveBeenCalledTimes(1);
            expect(executeCommand).toHaveBeenCalledTimes(1);
        });

        it('var', () => {
            const calculator = engineFactory();
            const varEvent = jest.fn().mockImplementation(name => {
                expect(name).toEqual('VAR_X');
            });
            const varCommand = jest.fn();

            expect(calculator.getExpression()).toStrictEqual('');
            expect(calculator.getPosition()).toStrictEqual(0);

            calculator.setVariableList({ x: 42 });
            calculator.on('term', varEvent);
            calculator.on('command-var', varCommand);
            calculator.invoke('var', 'x');

            expect(calculator.getExpression()).toStrictEqual('x');
            expect(calculator.getPosition()).toStrictEqual(1);
            expect(varEvent).toHaveBeenCalledTimes(1);
            expect(varCommand).toHaveBeenCalledTimes(1);
        });

        it('term with a single parameter', () => {
            const calculator = engineFactory();
            const termEvent = jest.fn().mockImplementation(name => {
                expect(name).toEqual('NUM3');
            });
            const termCommand = jest.fn();

            expect(calculator.getExpression()).toStrictEqual('');
            expect(calculator.getPosition()).toStrictEqual(0);

            calculator.on('term', termEvent);
            calculator.on('command-term', termCommand);
            calculator.invoke('term', 'NUM3');

            expect(calculator.getExpression()).toStrictEqual('3');
            expect(calculator.getPosition()).toStrictEqual(1);
            expect(termEvent).toHaveBeenCalledTimes(1);
            expect(termCommand).toHaveBeenCalledTimes(1);
        });

        it('term with multiple parameters', () => {
            const calculator = engineFactory();
            const terms = ['NUM3', 'ADD', 'NUM2'];
            const iterator = terms.values();
            const termEvent = jest.fn().mockImplementation(name => {
                const term = iterator.next().value;
                expect(name).toEqual(term);
            });
            const termCommand = jest.fn();

            expect(calculator.getExpression()).toStrictEqual('');
            expect(calculator.getPosition()).toStrictEqual(0);

            calculator.on('term', termEvent);
            calculator.on('command-term', termCommand);
            calculator.invoke('term', terms);

            expect(calculator.getExpression()).toStrictEqual('3+2');
            expect(calculator.getPosition()).toStrictEqual(3);
            expect(termEvent).toHaveBeenCalledTimes(3);
            expect(termCommand).toHaveBeenCalledTimes(1);
        });

        it('sign', () => {
            const calculator = engineFactory({ expression: '3*2' });
            const signEvent = jest.fn();
            const signCommand = jest.fn();

            calculator.on('expression', signEvent);
            calculator.on('command-sign', signCommand);
            calculator.invoke('sign');

            expect(calculator.getExpression()).toStrictEqual('3*-2');
            expect(calculator.getPosition()).toStrictEqual(4);
            expect(signEvent).toHaveBeenCalledTimes(1);
            expect(signCommand).toHaveBeenCalledTimes(1);
        });

        it('degree', () => {
            const calculator = engineFactory();
            const configEvent = jest.fn();
            const degreeCommand = jest.fn();

            expect(calculator.isDegreeMode()).toBeFalsy();

            calculator.on('configure', configEvent);
            calculator.on('command-degree', degreeCommand);
            calculator.invoke('degree');

            expect(calculator.isDegreeMode()).toBeTruthy();
            expect(configEvent).toHaveBeenCalledTimes(1);
            expect(degreeCommand).toHaveBeenCalledTimes(1);
        });

        it('radian', () => {
            const calculator = engineFactory({ maths: { degree: true } });
            const configEvent = jest.fn();
            const radianCommand = jest.fn();

            expect(calculator.isDegreeMode()).toBeTruthy();

            calculator.on('configure', configEvent);
            calculator.on('command-radian', radianCommand);
            calculator.invoke('radian');

            expect(calculator.isDegreeMode()).toBeFalsy();
            expect(configEvent).toHaveBeenCalledTimes(1);
            expect(radianCommand).toHaveBeenCalledTimes(1);
        });

        it('remind', () => {
            const calculator = engineFactory();
            const remindEvent = jest.fn().mockImplementation(name => {
                expect(name).toEqual('VAR_MEM');
            });
            const remindCommand = jest.fn();

            calculator.on('term', remindEvent);
            calculator.on('command-remind', remindCommand);

            expect(calculator.getExpression()).toStrictEqual('');
            expect(calculator.getPosition()).toStrictEqual(0);

            calculator.invoke('remind');

            expect(calculator.getExpression()).toStrictEqual('mem');
            expect(calculator.getPosition()).toStrictEqual(3);
            expect(remindEvent).toHaveBeenCalledTimes(1);
            expect(remindCommand).toHaveBeenCalledTimes(1);
        });

        it('memorize', () => {
            const variables = { x: '42' };
            const calculator = engineFactory();
            const memorizeEvent = jest.fn().mockImplementation((name, value) => {
                expect(name).toEqual('mem');
                expect(value.result).toEqual(2);
            });
            const memorizeCommand = jest.fn();

            calculator.setVariableList(variables);
            calculator.setLastResult(2);
            calculator.on('variableadd', memorizeEvent);
            calculator.on('command-memorize', memorizeCommand);

            expect(calculator.getVariableValue('ans')).toStrictEqual(2);
            expect(calculator.getVariableValue('mem')).toStrictEqual(0);
            expect(calculator.getVariableValue('x')).toStrictEqual(42);

            calculator.invoke('memorize');

            expect(calculator.getVariableValue('ans')).toStrictEqual(2);
            expect(calculator.getVariableValue('mem')).toStrictEqual(2);
            expect(calculator.getVariableValue('x')).toStrictEqual(42);
            expect(memorizeEvent).toHaveBeenCalledTimes(1);
            expect(memorizeCommand).toHaveBeenCalledTimes(1);
        });

        it('forget', () => {
            const variables = { x: '42' };
            const calculator = engineFactory();
            const forgetEvent = jest.fn().mockImplementation((name, value) => {
                expect(name).toEqual('mem');
                expect(value.result).toEqual(0);
            });
            const forgetCommand = jest.fn();

            calculator.setVariableList(variables);
            calculator.setLastResult(2);
            calculator.setMemory();
            calculator.on('variableadd', forgetEvent);
            calculator.on('command-forget', forgetCommand);

            expect(calculator.getVariableValue('ans')).toStrictEqual(2);
            expect(calculator.getVariableValue('mem')).toStrictEqual(2);
            expect(calculator.getVariableValue('x')).toStrictEqual(42);

            calculator.invoke('forget');

            expect(calculator.getVariableValue('ans')).toStrictEqual(2);
            expect(calculator.getVariableValue('mem')).toStrictEqual(0);
            expect(calculator.getVariableValue('x')).toStrictEqual(42);
            expect(forgetEvent).toHaveBeenCalledTimes(1);
            expect(forgetCommand).toHaveBeenCalledTimes(1);
        });

        it('moveLeft', () => {
            const calculator = engineFactory({ expression: '3+4*2', position: 2 });
            const moveEvent = jest.fn().mockImplementation(position => {
                expect(position).toEqual(1);
            });
            const moveCommand = jest.fn();

            calculator.on('position', moveEvent);
            calculator.on('command-moveLeft', moveCommand);
            calculator.invoke('moveLeft');

            expect(calculator.getPosition()).toStrictEqual(1);
            expect(moveEvent).toHaveBeenCalledTimes(1);
            expect(moveCommand).toHaveBeenCalledTimes(1);
        });

        it('moveRight', () => {
            const calculator = engineFactory({ expression: '3+4*2', position: 2 });
            const moveEvent = jest.fn().mockImplementation(position => {
                expect(position).toEqual(3);
            });
            const moveCommand = jest.fn();

            calculator.on('position', moveEvent);
            calculator.on('command-moveRight', moveCommand);
            calculator.invoke('moveRight');

            expect(calculator.getPosition()).toStrictEqual(3);
            expect(moveEvent).toHaveBeenCalledTimes(1);
            expect(moveCommand).toHaveBeenCalledTimes(1);
        });

        it('deleteLeft', () => {
            const calculator = engineFactory({ expression: '3+4*2', position: 2 });
            const moveEvent = jest.fn().mockImplementation(position => {
                expect(position).toEqual(1);
            });
            const exprEvent = jest.fn().mockImplementation(expression => {
                expect(expression).toEqual('34*2');
            });
            const deleteCommand = jest.fn();

            calculator.on('position', moveEvent);
            calculator.on('expression', exprEvent);
            calculator.on('command-deleteLeft', deleteCommand);
            calculator.invoke('deleteLeft');

            expect(calculator.getPosition()).toStrictEqual(1);
            expect(calculator.getExpression()).toEqual('34*2');
            expect(moveEvent).toHaveBeenCalledTimes(1);
            expect(exprEvent).toHaveBeenCalledTimes(1);
            expect(deleteCommand).toHaveBeenCalledTimes(1);
        });

        it('deleteRight', () => {
            const calculator = engineFactory({ expression: '3+4*2', position: 2 });
            const exprEvent = jest.fn().mockImplementation(expression => {
                expect(expression).toEqual('3+*2');
            });
            const deleteCommand = jest.fn();

            calculator.on('expression', exprEvent);
            calculator.on('command-deleteRight', deleteCommand);
            calculator.invoke('deleteRight');

            expect(calculator.getPosition()).toStrictEqual(2);
            expect(calculator.getExpression()).toEqual('3+*2');
            expect(exprEvent).toHaveBeenCalledTimes(1);
            expect(deleteCommand).toHaveBeenCalledTimes(1);
        });
    });
});
