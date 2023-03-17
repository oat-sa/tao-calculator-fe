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
 * Copyright (c) 2023 Open Assessment Technologies SA ;
 */

import tokenizerFactory from '../../tokenizer.js';
import { applyListStrategies } from '../helpers.js';
import { correctStrategies } from '../correct';

const tokenizer = tokenizerFactory();

describe('correctStrategies', () => {
    it('is a collection', () => {
        expect(correctStrategies).toEqual(expect.any(Array));
        expect(correctStrategies.length).toBeGreaterThan(0);
        correctStrategies.forEach(strategy => {
            expect(strategy).toEqual(expect.any(Function));
        });
    });

    it.each([
        ['', ''],

        // parenthesis
        ['3*4+2', '3*4+2'],
        ['3*(4+2)', '3*(4+2)'],
        ['3*(4+2', '3*(4+2)'],
        ['(3*(4+2', '(3*(4+2))'],
        ['3*(10-(2+1)+4', '3*(10-(2+1)+4)'],
        ['(3*(10-(2+1)', '(3*(10-(2+1)))'],
        ['(3*(10-(2+1))', '(3*(10-(2+1)))'],
        ['(3*(10-(2+1', '(3*(10-(2+1)))'],

        // dummy operators
        ['3*', '3'],
        ['3*(', '3'],
        ['3*4+', '3*4'],
        ['33!', '33!'],
        ['18+20#', '18+20#'],

        // dummy functions
        ['sin', ''],
        ['sin cos', ''],
        ['sin cos pi', 'sin cos pi'],

        // operators and parenthesis
        ['3*(4+', '3*(4)'],
        ['3*(4+5*(', '3*(4+5)'],
        ['3*(4+5*(sin+', '3*(4+5)']
    ])('correct the expression "%s" to "%s"', (expression, expected) => {
        const expressionTokens = tokenizer.tokenize(expression);
        const expectedTokens = tokenizer.tokenize(expected);
        expect(applyListStrategies(expressionTokens, correctStrategies)).toStrictEqual(expectedTokens);
    });
});
