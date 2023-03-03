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
import { replaceStrategies } from '../replace.js';

const tokenizer = tokenizerFactory();

describe('replaceStrategies', () => {
    it('is a collection', () => {
        expect(replaceStrategies).toEqual(expect.any(Array));
        expect(replaceStrategies[0]).toEqual(expect.any(Function));
    });

    it.each([
        ['', '', null],
        ['', 'ADD', null],
        ['1', 'ADD', null],
        ['E', 'ADD', null],
        ['sin', 'ADD', null],
        ['#', 'ADD', null],
        ['!', 'ADD', null],
        [')', 'ADD', null],
        ['(', 'ADD', null],
        ['+', 'ADD', true],
        ['-', 'ADD', true],
        ['*', 'ADD', true],
        ['/', 'ADD', true],
        ['^', 'ADD', true],
        ['%', 'ADD', true],
        ['=', 'ADD', true]
    ])('detect if the current token in %s must be replaced by the new term %s', (expression, token, expected) => {
        const tokens = tokenizer.tokenize(expression);
        expect(applyContextStrategies([tokens.pop(), terms[token]], replaceStrategies)).toStrictEqual(expected);
    });
});
