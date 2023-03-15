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

import { terms } from '../../terms.js';
import tokenizerFactory from '../../tokenizer.js';
import { applyContextStrategies } from '../helpers.js';
import { limitStrategies } from '../limit.js';

const tokenizer = tokenizerFactory();

describe('limitStrategies', () => {
    it('is a collection', () => {
        expect(limitStrategies).toEqual(expect.any(Array));
        expect(limitStrategies.length).toBeGreaterThan(0);
        limitStrategies.forEach(strategy => {
            expect(strategy).toEqual(expect.any(Function));
        });
    });

    it.each([
        // from an empty expression
        ['', '', null],
        ['NEG', '', null],
        ['SUB', '', null],
        ['POS', '', null],
        ['ADD', '', null],
        ['MUL', '', true],
        ['DIV', '', true],
        ['MOD', '', true],
        ['POW', '', true],
        ['FAC', '', true],
        ['ASSIGN', '', true],
        ['PERCENT', '', true],
        ['NTHRT', '', true],
        ['LPAR', '', null],
        ['RPAR', '', true],
        ['COMMA', '', true],
        ['SIN', '', null],
        ['NUM3', '', null],
        ['VAR_ANS', '', null],
        ['PI', '', null],

        // from an existing expression
        ['', '3', null],
        ['SUB', '3', null],
        ['MUL', '3', null],
        ['LPAR', '3', null],
        ['LPAR', ')', null],
        ['RPAR', '3', true],
        ['RPAR', '3+', true],
        ['RPAR', '(', true],
        ['RPAR', '(3+2', null],
        ['RPAR', '(3+2)', true],
        ['FAC', '(', true],
        ['FAC', 'sin', true]
    ])('detects if the new term "%s" must be rejected when added to "%s"', (token, expression, expected) => {
        const tokens = tokenizer.tokenize(expression);
        expect(applyContextStrategies([...tokens, terms[token]], limitStrategies)).toStrictEqual(expected);
    });
});
