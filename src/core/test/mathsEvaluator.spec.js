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
import mathsEvaluatorFactory from '../mathsEvaluator.js';
import expressions from './mathsEvaluator.json';

describe('mathsEvaluator', () => {
    it('is a factory', () => {
        expect(mathsEvaluatorFactory).toEqual(expect.any(Function));
        expect(mathsEvaluatorFactory()).toEqual(expect.any(Function));
        expect(mathsEvaluatorFactory()).not.toStrictEqual(mathsEvaluatorFactory());
    });

    it('exposes the parser', () => {
        expect(mathsEvaluatorFactory().parser).toEqual(expect.any(Object));
        expect(mathsEvaluatorFactory().parser.parse).toEqual(expect.any(Function));
        expect(mathsEvaluatorFactory().parser.evaluate).toEqual(expect.any(Function));
    });

    it.each(expressions)('processes the expression %s', (title, data) => {
        const evaluate = mathsEvaluatorFactory(data.config);
        const output = evaluate(data.expression, data.variables);

        if ('boolean' !== typeof output.value) {
            output.value = String(output.value);
        }

        expect(output.value).toEqual(data.expected);
        expect(output.expression).toEqual(data.expression);
        expect(output.variables).toEqual(data.variables);
        expect(output.result).not.toBeUndefined();
    });

    it('accepts expression as an object', () => {
        const evaluate = mathsEvaluatorFactory();
        const mathsExpression = {
            expression: '3*x + 1',
            variables: { x: 2 }
        };
        const output1 = evaluate(mathsExpression);

        expect(output1.value).toEqual(7);
        expect(output1.expression).toEqual(mathsExpression.expression);
        expect(output1.variables).toEqual(mathsExpression.variables);
        expect(output1.result).toBeInstanceOf(Decimal);
        expect(output1.result.toString()).toEqual('7');

        const variables = { x: 3 };
        const output2 = evaluate(mathsExpression, variables);

        expect(output2.value).toEqual(10);
        expect(output2.expression).toEqual(mathsExpression.expression);
        expect(output2.variables).toEqual(variables);
        expect(output2.result).toBeInstanceOf(Decimal);
        expect(output2.result.toString()).toEqual('10');
    });

    it('accepts expression as a number', () => {
        const evaluate = mathsEvaluatorFactory();
        const output1 = evaluate(42);

        expect(output1.value).toEqual(42);
        expect(output1.expression).toEqual('42');
        expect(output1.variables).toBeUndefined();
        expect(output1.result).toEqual(42);
    });
});
