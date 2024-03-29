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
            const action1 = jest.fn();
            const action2 = jest.fn();

            calculator.on('test', action1);
            calculator.on('test', action2);

            expect(calculator.trigger('test', 'foo', 'bar')).toBe(calculator);

            expect(action1).toHaveBeenCalledTimes(1);
            expect(action1.mock.contexts[0]).toBe(calculator);
            expect(action1.mock.calls[0][0]).toEqual('foo');
            expect(action1.mock.calls[0][1]).toEqual('bar');

            expect(action2).toHaveBeenCalledTimes(1);
            expect(action2.mock.contexts[0]).toBe(calculator);
            expect(action2.mock.calls[0][0]).toEqual('foo');
            expect(action2.mock.calls[0][1]).toEqual('bar');
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

    describe('manages the computation mode', () => {
        it('has on-demand mode by default', () => {
            const calculator = engineFactory();

            expect(calculator.isInstantMode()).toBeFalsy();
        });

        it('set the instant mode', () => {
            const calculator = engineFactory();

            expect(calculator.isInstantMode()).toBeFalsy();

            expect(calculator.setInstantMode(true)).toBe(calculator);
            expect(calculator.isInstantMode()).toBeTruthy();
        });

        it('set the on-demand mode', () => {
            const calculator = engineFactory({ instant: true });

            expect(calculator.isInstantMode()).toBeTruthy();

            expect(calculator.setInstantMode(false)).toBe(calculator);
            expect(calculator.isInstantMode()).toBeFalsy();
        });

        it('emits a configure event', () => {
            const calculator = engineFactory();
            const config = { instant: true };
            const action = jest.fn();

            calculator.on('configure', action);
            calculator.setInstantMode(true);

            expect(action).toHaveBeenCalledTimes(1);
            expect(action.mock.calls[0][0]).toStrictEqual(config);
        });

        it('can calculate on-demand', () => {
            const calculator = engineFactory();
            const action = jest.fn();

            expect(calculator.isInstantMode()).toBeFalsy();
            calculator.on('result', action);

            calculator.insertTermList('NUM3 MUL NUM4 SUB NUM2');

            expect(calculator.getExpression()).toStrictEqual('3*4-2');
            expect(action).not.toHaveBeenCalled();
            expect(calculator.evaluate()).toMatchSnapshot();
        });

        it('can calculate as soon as an operation is complete', () => {
            const calculator = engineFactory({ instant: true });
            const action = jest.fn();

            expect(calculator.isInstantMode()).toBeTruthy();
            calculator.on('result', action);

            calculator.insertTerm('NUM3');
            expect(calculator.getExpression()).toStrictEqual('3');

            calculator.insertTerm('DIV');
            calculator.insertTerm('MUL');
            expect(calculator.getExpression()).toStrictEqual('3*');

            calculator.insertTerm('NUM4');
            expect(calculator.getExpression()).toStrictEqual('3*4');

            calculator.insertTerm('NUM2');
            expect(calculator.getExpression()).toStrictEqual('3*42');

            calculator.insertTerm('SUB');
            expect(calculator.getExpression()).toStrictEqual('ans-');
            expect(calculator.getLastResult()).toMatchSnapshot();

            calculator.insertTerm('NUM2');
            expect(calculator.getExpression()).toStrictEqual('ans-2');

            calculator.insertTerm('SUB');
            calculator.insertTerm('ADD');
            expect(calculator.getExpression()).toStrictEqual('ans+');
            expect(calculator.getLastResult()).toMatchSnapshot();

            calculator.insertTerm('NUM7');
            expect(calculator.getExpression()).toStrictEqual('ans+7');

            calculator.evaluate();
            expect(calculator.getExpression()).toStrictEqual('ans+7');
            expect(calculator.getLastResult()).toMatchSnapshot();

            calculator.insertTerm('ADD');
            expect(calculator.getExpression()).toStrictEqual('ans+');

            calculator.insertTerm('NUM3');
            expect(calculator.getExpression()).toStrictEqual('ans+3');

            calculator.insertTerm('POW');
            expect(calculator.getExpression()).toStrictEqual('ans^');
            expect(calculator.getLastResult()).toMatchSnapshot();

            expect(action).toHaveBeenCalledTimes(4);
            expect(action.mock.calls[0][0]).toMatchSnapshot();
            expect(action.mock.calls[1][0]).toMatchSnapshot();
            expect(action.mock.calls[2][0]).toMatchSnapshot();
            expect(action.mock.calls[3][0]).toMatchSnapshot();
        });

        it('take care of parenthesis when the instant mode is activated', () => {
            const calculator = engineFactory({ instant: true });
            const action = jest.fn();

            expect(calculator.isInstantMode()).toBeTruthy();
            calculator.on('result', action);

            calculator.insertTerm('LPAR');
            expect(calculator.getExpression()).toStrictEqual('(');

            calculator.insertTerm('NUM3');
            expect(calculator.getExpression()).toStrictEqual('(3');

            calculator.insertTerm('DIV');
            calculator.insertTerm('MUL');
            expect(calculator.getExpression()).toStrictEqual('(3*');

            calculator.insertTerm('NUM4');
            expect(calculator.getExpression()).toStrictEqual('(3*4');

            calculator.insertTerm('NUM2');
            expect(calculator.getExpression()).toStrictEqual('(3*42');

            calculator.insertTerm('SUB');
            expect(calculator.getExpression()).toStrictEqual('(3*42-');
            expect(calculator.getLastResult()).toMatchSnapshot();

            calculator.insertTerm('NUM2');
            expect(calculator.getExpression()).toStrictEqual('(3*42-2');

            calculator.insertTerm('RPAR');
            expect(calculator.getExpression()).toStrictEqual('(3*42-2)');

            calculator.insertTerm('SUB');
            calculator.insertTerm('ADD');
            expect(calculator.getExpression()).toStrictEqual('ans+');
            expect(calculator.getLastResult()).toMatchSnapshot();

            calculator.insertTerm('NUM7');
            expect(calculator.getExpression()).toStrictEqual('ans+7');

            calculator.insertTerm('LPAR');
            expect(calculator.getExpression()).toStrictEqual('ans*(');
            expect(calculator.getLastResult()).toMatchSnapshot();

            expect(action).toHaveBeenCalledTimes(2);
            expect(action.mock.calls[0][0]).toMatchSnapshot();
            expect(action.mock.calls[1][0]).toMatchSnapshot();
        });

        it('can start another expression after an explicit evaluation', () => {
            const calculator = engineFactory({ instant: true });
            const action = jest.fn();

            expect(calculator.isInstantMode()).toBeTruthy();
            calculator.on('result', action);

            calculator.insertTerm('NUM3');
            expect(calculator.getExpression()).toStrictEqual('3');

            calculator.insertTerm('MUL');
            expect(calculator.getExpression()).toStrictEqual('3*');

            calculator.insertTerm('NUM4');
            expect(calculator.getExpression()).toStrictEqual('3*4');

            calculator.evaluate();
            calculator.insertTerm('NUM2');
            expect(calculator.getExpression()).toStrictEqual('2');
        });
    });

    describe('manages the corrector mode', () => {
        it('is disabled by default', () => {
            const calculator = engineFactory();

            expect(calculator.isCorrectorMode()).toBeFalsy();
        });

        it('change the corrector mode', () => {
            const calculator = engineFactory();

            expect(calculator.isCorrectorMode()).toBeFalsy();

            expect(calculator.setCorrectorMode(true)).toBe(calculator);
            expect(calculator.isCorrectorMode()).toBeTruthy();
        });

        it('set the corrector mode', () => {
            const calculator = engineFactory({ corrector: true });

            expect(calculator.isCorrectorMode()).toBeTruthy();

            expect(calculator.setCorrectorMode(false)).toBe(calculator);
            expect(calculator.isCorrectorMode()).toBeFalsy();
        });

        it('emits a configure event', () => {
            const calculator = engineFactory();
            const config = { corrector: true };
            const action = jest.fn();

            calculator.on('configure', action);
            calculator.setCorrectorMode(true);

            expect(action).toHaveBeenCalledTimes(1);
            expect(action.mock.calls[0][0]).toStrictEqual(config);
        });

        it('can correct a wrong expression', () => {
            const calculator = engineFactory({ corrector: true, expression: '3*(4+2+' });
            const action = jest.fn();

            expect(calculator.isCorrectorMode()).toBeTruthy();
            calculator.on('result', action);

            expect(calculator.getExpression()).toStrictEqual('3*(4+2+');
            calculator.invoke('execute');
            expect(calculator.getLastResult()).toMatchSnapshot();
            expect(calculator.getExpression()).toStrictEqual('3*(4+2)');
            expect(action).toHaveBeenCalledTimes(1);
        });

        it('does not modify a correct expression', () => {
            const calculator = engineFactory({ corrector: true, expression: '3*(4+2)' });
            const action = jest.fn();

            expect(calculator.isCorrectorMode()).toBeTruthy();
            calculator.on('result', action);

            expect(calculator.getExpression()).toStrictEqual('3*(4+2)');
            calculator.invoke('execute');
            expect(calculator.getLastResult()).toMatchSnapshot();
            expect(calculator.getExpression()).toStrictEqual('3*(4+2)');
            expect(action).toHaveBeenCalledTimes(1);
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
            const action = jest.fn();

            calculator.on('configure', action);
            calculator.configureMathsEvaluator(config);

            expect(action).toHaveBeenCalledTimes(1);
            expect(action.mock.calls[0][0]).toStrictEqual(config);
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
            const action = jest.fn();

            calculator.on('expression', action);
            calculator.setExpression(expression);

            expect(action).toHaveBeenCalledTimes(1);
            expect(action.mock.calls[0][0]).toStrictEqual(expression);
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
            const expression = '1+2';
            const position = 1;
            const calculator = engineFactory({ expression, position });
            const action = jest.fn();

            calculator.on('replace', action);
            calculator.replace('3*4', 2);

            expect(action).toHaveBeenCalledTimes(1);
            expect(action.mock.calls[0][0]).toStrictEqual(expression);
            expect(action.mock.calls[0][1]).toStrictEqual(position);
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
            const expression = '1+2';
            const position = 1;
            const calculator = engineFactory({ expression, position });
            const action = jest.fn();

            calculator.on('insert', action);
            calculator.insert('-3');

            expect(action).toHaveBeenCalledTimes(1);
            expect(action.mock.calls[0][0]).toStrictEqual(expression);
            expect(action.mock.calls[0][1]).toStrictEqual(position);
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
            const action = jest.fn();

            calculator.on('position', action);
            calculator.setPosition(2);

            expect(action).toHaveBeenCalledTimes(1);
            expect(action.mock.calls[0][0]).toStrictEqual(2);
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

        it.each([
            [1, '(1 + 2) * 3', 2, '(+ 2) * 3', 1],
            [1, '(+ 2) * 3', 4, '(2) * 3', 2],
            [4, '(2) * 3', 2, '(2) * ', 2],
            [7, '(1 + 2) * 3', 2, '(1 + 2) * 3', 2]
        ])('removes the token at %1 from %s', (at, expression, position, expectedExpression, expectedPosition) => {
            const calculator = engineFactory({ expression, position });
            const tokens = calculator.getTokens();

            expect(calculator.deleteToken(tokens[at])).toBe(calculator);
            expect(calculator.getExpression()).toEqual(expectedExpression);
            expect(calculator.getPosition()).toEqual(expectedPosition);

            expect(calculator.deleteToken()).toBe(calculator);
            expect(calculator.getExpression()).toEqual(expectedExpression);
            expect(calculator.getPosition()).toEqual(expectedPosition);
        });

        it.each([
            [1, 2, '(1 + 2) * 3', 2, '(2) * 3', 1],
            [2, 3, '(1 + 2) * 3', 11, '(1 ) * 3', 8],
            [5, 6, '(1 + 2) * 3', 2, '(1 + 2) ', 2]
        ])(
            'removes tokens range [%1, %1] from %s',
            (start, end, expression, position, expectedExpression, expectedPosition) => {
                const calculator = engineFactory({ expression, position });
                const tokens = calculator.getTokens();

                expect(calculator.deleteTokenRange(tokens[start], tokens[end])).toBe(calculator);
                expect(calculator.getExpression()).toEqual(expectedExpression);
                expect(calculator.getPosition()).toEqual(expectedPosition);

                expect(calculator.deleteTokenRange()).toBe(calculator);
                expect(calculator.getExpression()).toEqual(expectedExpression);
                expect(calculator.getPosition()).toEqual(expectedPosition);
            }
        );
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
            const action = jest.fn();

            calculator.on('variableadd', action);
            calculator.setVariable('foo', '3*4');

            expect(action).toHaveBeenCalledTimes(1);
            expect(action.mock.calls[0][0]).toStrictEqual('foo');
            expect(action.mock.calls[0][1]).toBe(calculator.getVariable('foo'));
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
            const action = jest.fn();

            calculator.setVariable('foo', '3*4');
            calculator.on('variabledelete', action);
            calculator.deleteVariable('foo');

            expect(action).toHaveBeenCalledTimes(1);
            expect(action.mock.calls[0][0]).toStrictEqual('foo');
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
            const action = jest.fn();

            calculator.on('commandadd', action);
            calculator.setCommand('foo', cmd);

            expect(action).toHaveBeenCalledTimes(1);
            expect(action.mock.calls[0][0]).toStrictEqual('foo');
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
            const action = jest.fn();

            calculator.setCommand('foo', cmd);
            calculator.on('commanddelete', action);
            calculator.deleteCommand('foo');

            expect(action).toHaveBeenCalledTimes(1);
            expect(action.mock.calls[0][0]).toStrictEqual('foo');
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
            const action = jest.fn();

            calculator.setCommand('foo', action);

            expect(calculator.invoke('foo', 42, 'bar')).toBeTruthy();

            expect(action).toHaveBeenCalledTimes(1);
            expect(action.mock.calls[0][0]).toStrictEqual(42);
            expect(action.mock.calls[0][1]).toStrictEqual('bar');
        });

        it('emits a command event', () => {
            const calculator = engineFactory();
            const action = jest.fn();
            const commandEvt = jest.fn();
            const actionEvt = jest.fn();

            calculator.setCommand('foo', action);
            calculator.setCommand('bar', () => {});
            calculator.on('command', commandEvt);
            calculator.on('command-foo', actionEvt);

            expect(calculator.invoke('foo', 42, 'bar')).toBeTruthy();

            expect(action).toHaveBeenCalledTimes(1);
            expect(action.mock.calls[0][0]).toStrictEqual(42);
            expect(action.mock.calls[0][1]).toStrictEqual('bar');

            expect(commandEvt).toHaveBeenCalledTimes(1);
            expect(commandEvt.mock.calls[0][0]).toStrictEqual('foo');
            expect(commandEvt.mock.calls[0][1]).toStrictEqual(42);
            expect(commandEvt.mock.calls[0][2]).toStrictEqual('bar');

            expect(actionEvt).toHaveBeenCalledTimes(1);
            expect(actionEvt.mock.calls[0][0]).toStrictEqual(42);
            expect(actionEvt.mock.calls[0][1]).toStrictEqual('bar');
        });

        it('emits an error event', () => {
            const calculator = engineFactory();
            const errorEvt = jest.fn();

            calculator.on('error', errorEvt);

            expect(calculator.invoke('foo', 42, 'bar')).toBeFalsy();

            expect(errorEvt).toHaveBeenCalledTimes(1);
            expect(errorEvt.mock.calls[0][0]).toEqual(expect.any(TypeError));
            expect(errorEvt.mock.calls[0][0].message).toStrictEqual('Invalid command: foo');
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
            const plugin = jest.fn();

            expect(calculator.addPlugin('foo', plugin)).toBe(calculator);
            expect(calculator.hasPlugin('foo')).toBeTruthy();
            expect(plugin).toHaveBeenCalledTimes(1);
            expect(plugin.mock.calls[0][0]).toBe(calculator);
        });

        it('adds a plugin again', () => {
            const calculator = engineFactory();
            const uninstall = jest.fn();
            const plugin = jest.fn().mockImplementation(() => uninstall);

            calculator.addPlugin('foo', plugin);
            calculator.addPlugin('foo', plugin);

            expect(calculator.hasPlugin('foo')).toBeTruthy();
            expect(plugin).toHaveBeenCalledTimes(2);
            expect(plugin.mock.calls[0][0]).toBe(calculator);
            expect(plugin.mock.calls[1][0]).toBe(calculator);
            expect(uninstall).toHaveBeenCalledTimes(1);
        });

        it('emits a pluginadd event', () => {
            const calculator = engineFactory();
            const plugin = jest.fn();
            const event = jest.fn();

            calculator.on('pluginadd', event);
            calculator.addPlugin('foo', plugin);

            expect(plugin).toHaveBeenCalledTimes(1);
            expect(plugin.mock.calls[0][0]).toBe(calculator);

            expect(event).toHaveBeenCalledTimes(1);
            expect(event.mock.calls[0][0]).toStrictEqual('foo');
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
            const event = jest.fn();

            calculator.addPlugin('foo', plugin);
            calculator.on('plugindelete', event);
            calculator.removePlugin('foo');

            expect(plugin).toHaveBeenCalledTimes(1);
            expect(event).toHaveBeenCalledTimes(1);
            expect(event.mock.calls[0][0]).toStrictEqual('foo');
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

            expect(calculator.insertTerm('NUM6')).toBeTruthy();
            expect(calculator.getExpression()).toStrictEqual('6');
            expect(calculator.getPosition()).toStrictEqual(1);
        });

        it('adds a prefixed term to the expression', () => {
            const calculator = engineFactory({ expression: '1' });

            expect(calculator.getExpression()).toStrictEqual('1');

            expect(calculator.insertTerm('@NTHRT')).toBeTruthy();
            expect(calculator.getExpression()).toStrictEqual('1@nthrt');
            expect(calculator.getPosition()).toStrictEqual(7);
        });

        it('adds a variable to the expression', () => {
            const calculator = engineFactory();
            calculator.setLastResult('42');

            expect(calculator.getExpression()).toStrictEqual('');

            expect(calculator.insertVariable('ans')).toBeTruthy();
            expect(calculator.getExpression()).toStrictEqual('ans');
            expect(calculator.getPosition()).toStrictEqual(3);
        });

        it.each([
            ['it is a 0, and the term to add is not an operator nor a dot', '0', 'NUM1', '1'],
            ['it is the last result, and the term to add is not an operator', 'ans', 'NUM1', '1']
        ])('replaces the expression by the term if %s', (title, expression, term, expected) => {
            const calculator = engineFactory({ expression });

            expect(calculator.insertTerm(term)).toBeTruthy();
            expect(calculator.getExpression()).toStrictEqual(expected);
        });

        it.each([
            ['SQRT', '1', ['sqrt 1', '1*sqrt']],
            ['SQRT', '(', ['sqrt(', '(sqrt']],
            ['SQRT', ')', ['sqrt)', ')*sqrt']],
            ['SQRT', '1+2', ['sqrt 1+2', '1*sqrt+2', '1+sqrt 2', '1+2*sqrt']],
            ['SQRT', 'exp', ['sqrt exp', 'exp sqrt', 'exp sqrt', 'exp sqrt']],
            ['@NTHRT', '1+2', ['@nthrt 1+2', '1@nthrt 2', '1+@nthrt 2', '1+2@nthrt']],

            ['DOT', '', ['0.']],
            ['DOT', '.', ['.', '.']],
            ['DOT', '0', ['0.0', '0.']],
            ['DOT', '(', ['0.*(', '(0.']],
            ['DOT', '2.1', ['0.2.1', '2.1', '2.1', '2.1']],

            ['NUM1', '(', ['1*(', '(1']],
            ['NUM1', ')', ['1)', ')*1']],
            ['NUM1', '2+exp', ['12+exp', '21+exp', '2+1*exp', '2+exp 1', '2+exp 1', '2+exp 1']],
            ['NUM1', 'exp+2', ['1*exp+2', 'exp 1+2', 'exp 1+2', 'exp 1+2', 'exp+12', 'exp+21']],
            ['NUM2', 'exp', ['2*exp', 'exp 2', 'exp 2', 'exp 2']],
            ['NUM3', 'PI', ['3*PI', 'PI*3', 'PI*3']],
            ['NUM3', '5!', ['35!', '53!', '5!*3']],
            ['NUM3', 'exp ln', ['3*exp ln', 'exp 3* ln', 'exp 3* ln', 'exp 3* ln', 'exp 3*ln', 'exp ln 3', 'exp ln 3']],
            ['NUM3', 'exp 2', ['3*exp 2', 'exp 3 2', 'exp 3 2', 'exp 3 2', 'exp 32', 'exp 23']],
            ['NUM3', '2*exp', ['32*exp', '23*exp', '2*3*exp', '2*exp 3', '2*exp 3', '2*exp 3']],

            ['LPAR', ')', ['()', ')*(']],
            ['LPAR', 'PI', ['(PI', 'PI*(', 'PI*(']],
            ['LPAR', '2', ['(2', '2*(']],
            ['LPAR', '2!', ['(2!', '2*(!', '2!*(']],
            ['LPAR', '2#', ['(2#', '2*(#', '2#*(']],

            ['RPAR', '(', ['(', '(']],
            ['RPAR', '3', ['3', '3']],
            ['RPAR', '(3', ['(3', '()*3', '(3)']],
            ['RPAR', 'ln', ['ln', 'ln', 'ln']],

            ['TEN', '5', ['TEN*5', '5*TEN']],
            ['TEN', '+', ['TEN+', '+TEN']],
            ['TEN', 'exp', ['TEN*exp', 'exp TEN', 'exp TEN', 'exp TEN']],
            ['PI', '5!', ['PI*5!', '5*PI!', '5!*PI']],

            [
                'COS',
                'exp ln',
                ['cos exp ln', 'exp cos ln', 'exp cos ln', 'exp cos ln', 'exp cos ln', 'exp ln cos', 'exp ln cos']
            ],
            ['COS', 'exp 2', ['cos exp 2', 'exp cos 2', 'exp cos 2', 'exp cos 2', 'exp cos 2', 'exp 2*cos']],
            ['COS', '2*exp', ['cos 2*exp', '2*cos*exp', '2*cos exp', '2*exp cos', '2*exp cos', '2*exp cos']],
            ['COS', '5!', ['cos 5!', '5*cos!', '5!*cos']],

            ['ADD', 'exp', ['+exp', 'exp+', 'exp+', 'exp+']],
            ['ADD', 'exp ln', ['+exp ln', 'exp+ ln', 'exp+ ln', 'exp+ ln', 'exp +ln', 'exp ln+', 'exp ln+']],
            ['ADD', 'exp 2', ['+exp 2', 'exp+ 2', 'exp+ 2', 'exp+ 2', 'exp +2', 'exp 2+']],
            ['ADD', '2*exp', ['+2*exp', '2+exp', '2*+exp', '2*exp+', '2*exp+', '2*exp+']],
            ['ADD', '5!', ['+5!', '5+!', '5!+']],
            ['ADD', '55*', ['+55*', '5+5*', '55+', '55+']],
            ['ADD', '55**', ['+55**', '5+5**', '55+*', '55+', '55+']],
            ['ADD', '55**+', ['+55**+', '5+5**+', '55+*+', '55++', '55+']],
            ['SUB', '55*', ['-55*', '5-5*', '55-*', '55*-']],
            ['SUB', '55**', ['-55**', '5-5**', '55-**', '55*-*', '55**-']],
            ['SUB', '55**-', ['-55**-', '5-5**-', '55-**-', '55*-*-', '55-']],

            ['FAC', '55+', ['!*55+', '5!*5+', '55!', '55!']],
            ['FAC', '55#', ['!*55#', '5!*5#', '55!#', '55#!']],
            ['FAC', '55!', ['!*55!', '5!*5!', '55!!', '55!!']]
        ])('inserts %s in %s', (term, expression, expected) => {
            const calculator = engineFactory();
            calculator.setLastResult('42');

            for (let position = 0; position < expected.length; position++) {
                calculator.replace(expression, position);
                calculator.insertTerm(term);
                expect(calculator.getExpression()).toStrictEqual(expected[position]);
            }
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
            const termEvt = jest.fn();

            calculator.on('term', termEvt);

            expect(calculator.addTerm('foo', term)).toBeTruthy();

            expect(termEvt).toHaveBeenCalledTimes(1);
            expect(termEvt.mock.calls[0][0]).toStrictEqual(term.name);
            expect(termEvt.mock.calls[0][1]).toBe(term);
        });

        it('emits an error event when an invalid term is used', () => {
            const calculator = engineFactory();
            const errorEvt = jest.fn();

            calculator.on('error', errorEvt);

            expect(calculator.addTerm('foo')).toBeFalsy();
            expect(calculator.addTerm('foo', {})).toBeFalsy();

            expect(errorEvt).toHaveBeenCalledTimes(2);
            expect(errorEvt.mock.calls[0][0]).toEqual(expect.any(TypeError));
            expect(errorEvt.mock.calls[0][0].message).toStrictEqual('Invalid term: foo');
            expect(errorEvt.mock.calls[1][0]).toEqual(expect.any(TypeError));
            expect(errorEvt.mock.calls[1][0].message).toStrictEqual('Invalid term: foo');
        });

        it('emits an error event when an unknown term is used', () => {
            const calculator = engineFactory();
            const errorEvt = jest.fn();

            calculator.on('error', errorEvt);

            expect(calculator.insertTerm('foo')).toBeFalsy();

            expect(errorEvt).toHaveBeenCalledTimes(1);
            expect(errorEvt.mock.calls[0][0]).toEqual(expect.any(TypeError));
            expect(errorEvt.mock.calls[0][0].message).toStrictEqual('Invalid term: foo');
        });

        it('emits an error event when an unknown variable is used', () => {
            const calculator = engineFactory();
            const errorEvt = jest.fn();

            calculator.on('error', errorEvt);

            expect(calculator.insertVariable('foo')).toBeFalsy();

            expect(errorEvt).toHaveBeenCalledTimes(1);
            expect(errorEvt.mock.calls[0][0]).toEqual(expect.any(TypeError));
            expect(errorEvt.mock.calls[0][0].message).toStrictEqual('Invalid variable: foo');
        });

        it.each([
            [['NUM1', 'ADD', 'NUM2'], true, 3, '1+2'],
            ['NUM1 ADD NUM2', true, 3, '1+2'],
            ['POW NUM2', false, 0, ''],
            ['POW NEG NUM1', false, 0, '']
        ])('adds a list of terms to the expression from %s', (terms, result, position, expected) => {
            const calculator = engineFactory();

            expect(calculator.getExpression()).toStrictEqual('');

            expect(calculator.insertTermList(terms)).toStrictEqual(result);
            expect(calculator.getExpression()).toStrictEqual(expected);
            expect(calculator.getPosition()).toStrictEqual(position);
        });
    });

    describe('corrects the expression', () => {
        it('from an empty expression', () => {
            const calculator = engineFactory();

            expect(calculator.correct()).toBe(calculator);
            expect(calculator.getExpression()).toStrictEqual('');
        });

        it('from a valid expression', () => {
            const expression = '.1 + .2 * (4 + 5)';
            const calculator = engineFactory({ expression });
            const replace = jest.fn();
            calculator.on('replace', replace);

            expect(calculator.correct()).toBe(calculator);
            expect(calculator.getExpression()).toStrictEqual(expression);
            expect(replace).toHaveBeenCalledTimes(0);
        });

        it('from a wrong expression', () => {
            const calculator = engineFactory({ expression: '3*(4+5*(sin+' });
            const replace = jest.fn();
            calculator.on('replace', replace);

            expect(calculator.correct()).toBe(calculator);
            expect(calculator.getExpression()).toStrictEqual('3*(4+5)');
            expect(replace).toHaveBeenCalledTimes(1);
        });

        it('emits a correct event', () => {
            const calculator = engineFactory({ expression: '3+2*' });
            const eventListener = jest.fn();

            calculator.on('correct', eventListener);
            calculator.correct();
            calculator.correct();

            expect(eventListener).toHaveBeenCalledTimes(1);
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

        it('does not update the last result if an error occurred', () => {
            const calculator = engineFactory({ expression: '3*4' });

            calculator.evaluate();
            calculator.insertTerm('DIV');
            calculator.insertTerm('NUM0');
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
            let variable;
            const eventListener = jest.fn().mockImplementation(() => {
                variable = calculator.getVariableValue('ans');
            });

            calculator.on('evaluate', eventListener);
            const result = calculator.evaluate();

            expect(eventListener).toHaveBeenCalledTimes(1);
            expect(eventListener.mock.calls[0][0]).toStrictEqual(result);
            expect(variable.toString()).toEqual('0');
        });

        it('emits a result event', () => {
            const calculator = engineFactory({ expression: '.1 + .2' });
            let variable;
            const eventListener = jest.fn().mockImplementation(() => {
                variable = calculator.getVariableValue('ans');
            });

            calculator.on('result', eventListener);
            const result = calculator.evaluate();

            expect(eventListener).toHaveBeenCalledTimes(1);
            expect(eventListener.mock.calls[0][0]).toStrictEqual(result);
            expect(variable.toString()).toEqual('0.3');
        });

        it('emits a syntaxerror event', () => {
            const calculator = engineFactory({ expression: '3 *' });
            const action = jest.fn();

            calculator.on('syntaxerror', action);
            calculator.evaluate();

            expect(action).toHaveBeenCalledTimes(1);
            expect(action.mock.calls[0][0].toString()).toStrictEqual('Error: unexpected TEOF: EOF');
        });

        it('emits a syntaxerror event if the single term is not a value', () => {
            const calculator = engineFactory({ expression: 'cos' });
            const action = jest.fn();

            calculator.on('syntaxerror', action);
            calculator.evaluate();

            expect(action).toHaveBeenCalledTimes(1);
            expect(action.mock.calls[0][0].toString()).toStrictEqual('Error: Invalid expression');
        });
    });

    describe('has state', () => {
        describe('changed', () => {
            it('is initially true', () => {
                const calculator = engineFactory({ expression: '1+2' });

                expect(calculator.changed).toBeTruthy();
            });

            it('is false once the expression has been processed', () => {
                const calculator = engineFactory({ expression: '1+2' });
                calculator.evaluate();

                expect(calculator.changed).toBeFalsy();
            });

            it('is true again as as soon as the expression is modified', () => {
                const calculator = engineFactory({ expression: '1+2' });
                calculator.evaluate();

                calculator.setExpression('');

                expect(calculator.changed).toBeTruthy();
            });
        });

        describe('error', () => {
            it('is initially false', () => {
                const calculator = engineFactory({ expression: '1+2' });

                expect(calculator.error).toBeFalsy();
            });

            it('remains false if the expression is successfully evaluated', () => {
                const calculator = engineFactory({ expression: '1+2' });
                calculator.evaluate();

                expect(calculator.error).toBeFalsy();
            });

            it('is true if the expression failed to be calculated', () => {
                const calculator = engineFactory({ expression: '1+' });
                calculator.evaluate();

                expect(calculator.error).toBeTruthy();
            });

            it('is true if the expression produced a wrong result', () => {
                const calculator = engineFactory({ expression: '0/0' });
                calculator.evaluate();

                expect(calculator.error).toBeTruthy();
            });

            it('is false if the expression has changed', () => {
                const calculator = engineFactory({ expression: '1+' });
                calculator.evaluate();
                calculator.insertTerm('NUM3');

                expect(calculator.error).toBeFalsy();
            });
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

        it('using the last result with an irrational number', () => {
            const calculator = engineFactory();
            calculator.setExpression('1/3');
            calculator.evaluate();
            calculator.setExpression('ans*3');

            expect(calculator.render()).toMatchSnapshot();
        });

        it('emits a render event', () => {
            const calculator = engineFactory({ expression: '.1 + .2' });
            const action = jest.fn();

            calculator.on('render', action);
            calculator.render();

            expect(action).toHaveBeenCalledTimes(1);
            expect(action.mock.calls[0][0]).toMatchSnapshot();
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
            const evaluateEvent = jest.fn();
            const resultEvent = jest.fn();
            const executeCommand = jest.fn();

            calculator.setVariableList(variables);
            calculator.on('evaluate', evaluateEvent);
            calculator.on('result', resultEvent);
            calculator.on('command-execute', executeCommand);
            calculator.invoke('execute');

            expect(calculator.getVariableValue('ans').toString()).toEqual('126');
            expect(evaluateEvent).toHaveBeenCalledTimes(1);
            expect(resultEvent).toHaveBeenCalledTimes(1);
            expect(executeCommand).toHaveBeenCalledTimes(1);
        });

        it('var', () => {
            const calculator = engineFactory();
            const varEvent = jest.fn();
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
            expect(varEvent.mock.calls[0][0]).toEqual('VAR_X');
            expect(varCommand).toHaveBeenCalledTimes(1);
        });

        it('term with a single parameter', () => {
            const calculator = engineFactory();
            const termEvent = jest.fn();
            const termCommand = jest.fn();

            expect(calculator.getExpression()).toStrictEqual('');
            expect(calculator.getPosition()).toStrictEqual(0);

            calculator.on('term', termEvent);
            calculator.on('command-term', termCommand);
            calculator.invoke('term', 'NUM3');

            expect(calculator.getExpression()).toStrictEqual('3');
            expect(calculator.getPosition()).toStrictEqual(1);
            expect(termEvent).toHaveBeenCalledTimes(1);
            expect(termEvent.mock.calls[0][0]).toEqual('NUM3');
            expect(termCommand).toHaveBeenCalledTimes(1);
        });

        it('term with multiple parameters', () => {
            const calculator = engineFactory();
            const terms = ['NUM3', 'ADD', 'NUM2'];
            const termEvent = jest.fn();
            const termCommand = jest.fn();

            expect(calculator.getExpression()).toStrictEqual('');
            expect(calculator.getPosition()).toStrictEqual(0);

            calculator.on('term', termEvent);
            calculator.on('command-term', termCommand);
            calculator.invoke('term', terms);

            expect(calculator.getExpression()).toStrictEqual('3+2');
            expect(calculator.getPosition()).toStrictEqual(3);
            expect(termEvent).toHaveBeenCalledTimes(3);
            expect(termEvent.mock.calls[0][0]).toEqual('NUM3');
            expect(termEvent.mock.calls[1][0]).toEqual('ADD');
            expect(termEvent.mock.calls[2][0]).toEqual('NUM2');
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
            const remindEvent = jest.fn();
            const remindCommand = jest.fn();

            calculator.on('term', remindEvent);
            calculator.on('command-remind', remindCommand);

            expect(calculator.getExpression()).toStrictEqual('');
            expect(calculator.getPosition()).toStrictEqual(0);

            calculator.invoke('remind');

            expect(calculator.getExpression()).toStrictEqual('mem');
            expect(calculator.getPosition()).toStrictEqual(3);
            expect(remindEvent).toHaveBeenCalledTimes(1);
            expect(remindEvent.mock.calls[0][0]).toEqual('VAR_MEM');
            expect(remindCommand).toHaveBeenCalledTimes(1);
        });

        it('memorize', () => {
            const variables = { x: '42' };
            const calculator = engineFactory();
            const memorizeEvent = jest.fn();
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
            expect(memorizeEvent.mock.calls[0][0]).toEqual('mem');
            expect(memorizeEvent.mock.calls[0][1].result).toEqual(2);
            expect(memorizeCommand).toHaveBeenCalledTimes(1);
        });

        it('forget', () => {
            const variables = { x: '42' };
            const calculator = engineFactory();
            const forgetEvent = jest.fn();
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
            expect(forgetEvent.mock.calls[0][0]).toEqual('mem');
            expect(forgetEvent.mock.calls[0][1].result).toEqual(0);
            expect(forgetCommand).toHaveBeenCalledTimes(1);
        });

        it('moveLeft', () => {
            const calculator = engineFactory({ expression: '3+4*2', position: 2 });
            const moveEvent = jest.fn();
            const moveCommand = jest.fn();

            calculator.on('position', moveEvent);
            calculator.on('command-moveLeft', moveCommand);
            calculator.invoke('moveLeft');

            expect(calculator.getPosition()).toStrictEqual(1);
            expect(moveEvent).toHaveBeenCalledTimes(1);
            expect(moveEvent.mock.calls[0][0]).toEqual(1);
            expect(moveCommand).toHaveBeenCalledTimes(1);
        });

        it('moveRight', () => {
            const calculator = engineFactory({ expression: '3+4*2', position: 2 });
            const moveEvent = jest.fn();
            const moveCommand = jest.fn();

            calculator.on('position', moveEvent);
            calculator.on('command-moveRight', moveCommand);
            calculator.invoke('moveRight');

            expect(calculator.getPosition()).toStrictEqual(3);
            expect(moveEvent).toHaveBeenCalledTimes(1);
            expect(moveEvent.mock.calls[0][0]).toEqual(3);
            expect(moveCommand).toHaveBeenCalledTimes(1);
        });

        it('deleteLeft', () => {
            const calculator = engineFactory({ expression: '3+4*2', position: 2 });
            const moveEvent = jest.fn();
            const exprEvent = jest.fn();
            const deleteCommand = jest.fn();

            calculator.on('position', moveEvent);
            calculator.on('expression', exprEvent);
            calculator.on('command-deleteLeft', deleteCommand);
            calculator.invoke('deleteLeft');

            expect(calculator.getPosition()).toStrictEqual(1);
            expect(calculator.getExpression()).toEqual('34*2');
            expect(moveEvent).toHaveBeenCalledTimes(1);
            expect(moveEvent.mock.calls[0][0]).toEqual(1);
            expect(exprEvent).toHaveBeenCalledTimes(1);
            expect(exprEvent.mock.calls[0][0]).toEqual('34*2');
            expect(deleteCommand).toHaveBeenCalledTimes(1);
        });

        it('deleteRight', () => {
            const calculator = engineFactory({ expression: '3+4*2', position: 2 });
            const exprEvent = jest.fn();
            const deleteCommand = jest.fn();

            calculator.on('expression', exprEvent);
            calculator.on('command-deleteRight', deleteCommand);
            calculator.invoke('deleteRight');

            expect(calculator.getPosition()).toStrictEqual(2);
            expect(calculator.getExpression()).toEqual('3+*2');
            expect(exprEvent).toHaveBeenCalledTimes(1);
            expect(exprEvent.mock.calls[0][0]).toEqual('3+*2');
            expect(deleteCommand).toHaveBeenCalledTimes(1);
        });
    });
});
