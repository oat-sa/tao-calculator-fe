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

import tokenizerFactory from '../../tokenizer.js';
import { applyTokenStrategies } from '../helpers.js';
import { signStrategies } from '../sign.js';

const tokenizer = tokenizerFactory();

describe('signStrategies', () => {
    it('is a collection', () => {
        expect(signStrategies).toEqual(expect.any(Array));
        expect(signStrategies[0]).toEqual(expect.any(Function));
    });

    it.each([
        ['', 0, null],
        ['1', 0, { length: 0, move: 1, offset: 0, value: '-' }],
        ['-1', 1, { length: 1, move: -1, offset: 0, value: '' }],
        ['+1', 1, { length: 1, move: 0, offset: 0, value: '-' }],
        ['!1', 1, { length: 0, move: 1, offset: 1, value: '-' }],
        ['3*!2', 2, null],
        ['3*!2', 3, { length: 0, move: 1, offset: 3, value: '-' }],
        ['!-1', 1, { length: 1, move: 0, offset: 1, value: '+' }],
        ['1-2', 1, { length: 1, move: 0, offset: 1, value: '+' }],
        ['1-2', 2, { length: 1, move: 0, offset: 1, value: '+' }],
        ['1+2', 1, { length: 1, move: 0, offset: 1, value: '-' }],
        ['1+2', 2, { length: 1, move: 0, offset: 1, value: '-' }],
        ['1+-2', 3, { length: 1, move: -1, offset: 2, value: '' }],
        ['3*2', 2, { length: 0, move: 1, offset: 2, value: '-' }],
        ['3*-2', 3, { length: 1, move: -1, offset: 2, value: '' }],
        ['cos 3', 1, { length: 0, move: 1, offset: 4, value: '-' }],
        ['(3', 1, { length: 0, move: 1, offset: 1, value: '-' }],
        ['PI', 0, { length: 0, move: 1, offset: 0, value: '-' }],
        ['-PI', 0, { length: 1, move: -1, offset: 0, value: '' }],
        ['-PI', 1, { length: 1, move: -1, offset: 0, value: '' }],
        ['3*PI', 2, { length: 0, move: 1, offset: 2, value: '-' }],
        ['3*-PI', 2, { length: 1, move: -1, offset: 2, value: '' }],
        ['3*-PI', 3, { length: 1, move: -1, offset: 2, value: '' }],
        ['3*(PI-1)+2', 2, { length: 0, move: 1, offset: 2, value: '-' }],
        ['3*(PI-1)+2', 3, { length: 0, move: 1, offset: 3, value: '-' }],
        ['3*(PI-1)+2', 6, { length: 0, move: 1, offset: 2, value: '-' }],
        ['3*-(PI-1)+2', 3, { length: 1, move: -1, offset: 2, value: '' }],
        ['3*(-PI-1)+2', 4, { length: 1, move: -1, offset: 3, value: '' }],
        ['3*-(PI-1)+2', 7, { length: 1, move: -1, offset: 2, value: '' }],
        ['(PI-1)+2', 4, { length: 0, move: 1, offset: 0, value: '-' }],
        ['(PI*(3-2))', 8, { length: 0, move: 1, offset: 0, value: '-' }],
        ['-(PI*(3-2))', 9, { length: 1, move: -1, offset: 0, value: '' }]
    ])('changes the sign in "%s" at index "%s"', (expression, index, expected) => {
        const tokens = tokenizer.tokenize(expression);
        expect(applyTokenStrategies(index, tokens, signStrategies)).toStrictEqual(expected);
    });
});
