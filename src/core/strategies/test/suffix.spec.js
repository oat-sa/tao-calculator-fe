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
import { suffixStrategies } from '../suffix';

describe('suffixStrategies', () => {
    it('is a collection', () => {
        expect(suffixStrategies).toEqual(expect.any(Array));
        expect(suffixStrategies[0]).toEqual(expect.any(Object));
        expect(suffixStrategies[0].predicate).toEqual(expect.any(Function));
        expect(suffixStrategies[0].action).toEqual(expect.any(Function));
    });

    it.each([
        // value, name, next, expected
        [')', 'RPAR', 'LPAR', ')*'],
        [')', 'RPAR', 'NUM1', ')*'],
        [')', 'RPAR', 'COS', ')*'],
        ['1', 'NUM1', 'LPAR', '1*'],
        ['!', 'FAC', 'LPAR', '!*'],
        ['!', 'FAC', 'NUM1', '!*'],
        ['!', 'FAC', 'COS', '!*'],
        ['!', 'FAC', 'PI', '!*'],
        ['!', 'FAC', 'ADD', '!'],
        ['PI', 'PI', 'LPAR', 'PI*'],
        ['cos', 'COS', 'LPAR', 'cos'],
        ['PI', 'PI', 'NUM1', 'PI*'],
        ['PI', 'PI', 'ADD', 'PI'],
        ['cos', 'COS', 'NUM1', 'cos '],
        ['cos', 'COS', 'ADD', 'cos'],
        ['1', 'NUM1', 'COS', '1*'],
        ['1', 'NUM1', 'ADD', '1'],
        ['cos', 'COS', 'ADD', 'cos'],
        ['cos', 'COS', 'NUM', 'cos ']
    ])('adds a separator to "%s" between "%s" and "%s"', (value, previous, next, expected) => {
        expect(applyValueStrategies(value, previous, next, suffixStrategies)).toEqual(expected);
    });
});
