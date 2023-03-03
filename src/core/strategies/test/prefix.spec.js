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

import { applyValueStrategies } from '../helpers.js';
import { prefixStrategies } from '../prefix.js';

describe('prefixStrategies', () => {
    it('is a collection', () => {
        expect(prefixStrategies).toEqual(expect.any(Array));
        expect(prefixStrategies[0]).toEqual(expect.any(Object));
        expect(prefixStrategies[0].predicate).toEqual(expect.any(Function));
        expect(prefixStrategies[0].action).toEqual(expect.any(Function));
    });

    it.each([
        // value, previous, name, expected
        ['(', 'RPAR', 'LPAR', '*('],
        ['(', 'NUM1', 'LPAR', '*('],
        ['(', 'FAC', 'LPAR', '*('],
        ['(', 'PERCENT', 'LPAR', '*('],
        ['1', 'RPAR', 'NUM1', '*1'],
        ['1', 'FAC', 'NUM1', '*1'],
        ['cos', 'RPAR', 'COS', '*cos'],
        ['cos', 'NUM1', 'COS', '*cos'],
        ['cos', 'FAC', 'COS', '*cos'],
        ['@nthrt', 'RPAR', 'NTHRT', '@nthrt'],
        ['@nthrt', 'NUM1', 'NTHRT', '@nthrt'],
        ['@nthrt', 'FAC', 'NTHRT', '@nthrt'],
        ['PI', 'NUM1', 'PI', '*PI'],
        ['PI', 'FAC', 'PI', '*PI'],
        ['1', 'PI', 'NUM1', '*1'],
        ['1', 'COS', 'NUM1', ' 1'],
        ['PI', 'COS', 'PI', ' PI'],
        ['-', 'COS', 'SUB', '-'],
        ['(', 'COS', 'LPAR', '(']
    ])('adds a separator to %s between %s and %s', (value, previous, next, expected) => {
        expect(applyValueStrategies(value, previous, next, prefixStrategies)).toEqual(expected);
    });
});
