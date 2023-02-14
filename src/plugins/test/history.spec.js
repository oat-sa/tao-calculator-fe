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
 * Copyright (c) 2018-2023 Open Assessment Technologies SA ;
 */

import engineFactory from '../../core/engine.js';
import historyPlugin from '../history.js';

describe('history plugin', () => {
    it('is a factory', () => {
        expect(historyPlugin).toEqual(expect.any(Function));
    });

    it('installs inside the calculator', () => {
        const calculator = engineFactory();

        expect(calculator.hasCommand('historyClear')).toBeFalsy();
        expect(calculator.hasCommand('historyUp')).toBeFalsy();
        expect(calculator.hasCommand('historyDown')).toBeFalsy();

        const uninstall = historyPlugin(calculator);
        expect(uninstall).toEqual(expect.any(Function));

        expect(calculator.hasCommand('historyClear')).toBeTruthy();
        expect(calculator.hasCommand('historyUp')).toBeTruthy();
        expect(calculator.hasCommand('historyDown')).toBeTruthy();
    });

    it('uninstalls from the calculator', () => {
        const calculator = engineFactory();

        calculator.addPlugin('history', historyPlugin);

        expect(calculator.hasCommand('historyClear')).toBeTruthy();
        expect(calculator.hasCommand('historyUp')).toBeTruthy();
        expect(calculator.hasCommand('historyDown')).toBeTruthy();

        calculator.removePlugin('history');

        expect(calculator.hasCommand('historyClear')).toBeFalsy();
        expect(calculator.hasCommand('historyUp')).toBeFalsy();
        expect(calculator.hasCommand('historyDown')).toBeFalsy();
    });

    it('memorizes the expression', () => {
        const plugins = {
            history: historyPlugin
        };
        const calculator = engineFactory({ plugins });
        const expressions = ['1+2', '3*4', 'cos PI'];

        expressions.forEach(expression => {
            calculator.setExpression(expression);
            calculator.evaluate();
        });

        calculator.setExpression('');

        calculator.invoke('historyUp');
        expect(calculator.getExpression()).toEqual(expressions[2]);

        calculator.invoke('historyUp');
        expect(calculator.getExpression()).toEqual(expressions[1]);

        calculator.invoke('historyUp');
        expect(calculator.getExpression()).toEqual(expressions[0]);

        calculator.invoke('historyDown');
        expect(calculator.getExpression()).toEqual(expressions[1]);
    });

    it('memorizes the expression with variables', () => {
        const plugins = {
            history: historyPlugin
        };
        const calculator = engineFactory({ plugins });

        calculator.setExpression('3*4');
        calculator.evaluate();

        calculator.setExpression('ans/3');
        expect(calculator.evaluate().result.toString()).toEqual('4');

        calculator.invoke('historyUp');
        expect(calculator.evaluate().result.toString()).toEqual('4');
    });

    it('clears the memory', () => {
        const plugins = {
            history: historyPlugin
        };
        const calculator = engineFactory({ plugins });
        const expressions = ['1+2', '3*4'];

        expressions.forEach(expression => {
            calculator.setExpression(expression);
            calculator.evaluate();
        });

        calculator.setExpression('');
        calculator.invoke('historyClear');

        calculator.invoke('historyUp');
        expect(calculator.getExpression()).toEqual('');

        calculator.invoke('historyDown');
        expect(calculator.getExpression()).toEqual('');
    });
});
