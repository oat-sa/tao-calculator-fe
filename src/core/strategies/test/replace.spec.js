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
        expect(replaceStrategies.length).toBeGreaterThan(0);
        replaceStrategies.forEach(strategy => {
            expect(strategy).toEqual(expect.any(Function));
        });
    });

    it.each([
        ['', '', null],
        ['ADD', '', null],
        ['ADD', '1', null],
        ['ADD', 'E', null],
        ['ADD', 'sin', null],

        ['NUM1', '', null],
        ['NUM1', '', null],
        ['NUM1', '1', null],
        ['NUM1', 'E', null],
        ['NUM1', 'sin', null],

        ['ADD', '3#', null],
        ['ADD', '3!', null],
        ['ADD', '3)', null],
        ['ADD', '3*(', null],
        ['ADD', '3+', 1],
        ['ADD', '3-', 1],
        ['ADD', '3*', 1],
        ['ADD', '3/', 1],
        ['ADD', '3^', 1],
        ['ADD', '3%', 1],
        ['ADD', '3=', 1],
        ['ADD', '3++', 2],
        ['ADD', '3--', 2],
        ['ADD', '3**', 2],
        ['ADD', '3//', 2],
        ['ADD', '3^^', 2],
        ['ADD', '3%%', 2],
        ['ADD', '3==', 2],

        ['SUB', '3#', null],
        ['SUB', '3!', null],
        ['SUB', '3)', null],
        ['SUB', '3*(', null],
        ['SUB', '3+', 1],
        ['SUB', '3-', 1],
        ['SUB', '3*', 0],
        ['SUB', '3/', 0],
        ['SUB', '3^', 0],
        ['SUB', '3%', 0],
        ['SUB', '3=', 0],
        ['SUB', '3++', 2],
        ['SUB', '3--', 2],
        ['SUB', '3**', 0],
        ['SUB', '3//', 0],
        ['SUB', '3^^', 0],
        ['SUB', '3%%', 0],
        ['SUB', '3==', 0],

        ['MUL', '3#', null],
        ['MUL', '3!', null],
        ['MUL', '3)', null],
        ['MUL', '3*(', null],
        ['MUL', '3+', 1],
        ['MUL', '3-', 1],
        ['MUL', '3*', 1],
        ['MUL', '3/', 1],
        ['MUL', '3^', 1],
        ['MUL', '3%', 1],
        ['MUL', '3=', 1],
        ['MUL', '3++', 2],
        ['MUL', '3--', 2],
        ['MUL', '3**', 2],
        ['MUL', '3//', 2],
        ['MUL', '3^^', 2],
        ['MUL', '3%%', 2],
        ['MUL', '3==', 2],

        ['DIV', '3#', null],
        ['DIV', '3!', null],
        ['DIV', '3)', null],
        ['DIV', '3*(', null],
        ['DIV', '3+', 1],
        ['DIV', '3-', 1],
        ['DIV', '3*', 1],
        ['DIV', '3/', 1],
        ['DIV', '3^', 1],
        ['DIV', '3%', 1],
        ['DIV', '3=', 1],
        ['DIV', '3++', 2],
        ['DIV', '3--', 2],
        ['DIV', '3**', 2],
        ['DIV', '3//', 2],
        ['DIV', '3^^', 2],
        ['DIV', '3%%', 2],
        ['DIV', '3==', 2],

        ['FAC', '3#', null],
        ['FAC', '3!', null],
        ['FAC', '3)', null],
        ['FAC', '3*(', null],
        ['FAC', '3+', 1],
        ['FAC', '3-', 1],
        ['FAC', '3*', 1],
        ['FAC', '3/', 1],
        ['FAC', '3^', 1],
        ['FAC', '3%', 1],
        ['FAC', '3=', 1],
        ['FAC', '3++', 2],
        ['FAC', '3--', 2],
        ['FAC', '3**', 2],
        ['FAC', '3//', 2],
        ['FAC', '3^^', 2],
        ['FAC', '3%%', 2],
        ['FAC', '3==', 2],

        ['PERCENT', '3#', null],
        ['PERCENT', '3!', null],
        ['PERCENT', '3)', null],
        ['PERCENT', '3*(', null],
        ['PERCENT', '3+', 1],
        ['PERCENT', '3-', 1],
        ['PERCENT', '3*', 1],
        ['PERCENT', '3/', 1],
        ['PERCENT', '3^', 1],
        ['PERCENT', '3%', 1],
        ['PERCENT', '3=', 1],
        ['PERCENT', '3++', 2],
        ['PERCENT', '3--', 2],
        ['PERCENT', '3**', 2],
        ['PERCENT', '3//', 2],
        ['PERCENT', '3^^', 2],
        ['PERCENT', '3%%', 2],
        ['PERCENT', '3==', 2],

        ['POW', '3#', null],
        ['POW', '3!', null],
        ['POW', '3)', null],
        ['POW', '3*(', null],
        ['POW', '3+', 1],
        ['POW', '3-', 1],
        ['POW', '3*', 1],
        ['POW', '3/', 1],
        ['POW', '3^', 1],
        ['POW', '3%', 1],
        ['POW', '3=', 1],
        ['POW', '3++', 2],
        ['POW', '3--', 2],
        ['POW', '3**', 2],
        ['POW', '3//', 2],
        ['POW', '3^^', 2],
        ['POW', '3%%', 2],
        ['POW', '3==', 2],

        ['MOD', '3#', null],
        ['MOD', '3!', null],
        ['MOD', '3)', null],
        ['MOD', '3*(', null],
        ['MOD', '3+', 1],
        ['MOD', '3-', 1],
        ['MOD', '3*', 1],
        ['MOD', '3/', 1],
        ['MOD', '3^', 1],
        ['MOD', '3%', 1],
        ['MOD', '3=', 1],
        ['MOD', '3++', 2],
        ['MOD', '3--', 2],
        ['MOD', '3**', 2],
        ['MOD', '3//', 2],
        ['MOD', '3^^', 2],
        ['MOD', '3%%', 2],
        ['MOD', '3==', 2],

        ['ASSIGN', '3#', null],
        ['ASSIGN', '3!', null],
        ['ASSIGN', '3)', null],
        ['ASSIGN', '3*(', null],
        ['ASSIGN', '3+', 1],
        ['ASSIGN', '3-', 1],
        ['ASSIGN', '3*', 1],
        ['ASSIGN', '3/', 1],
        ['ASSIGN', '3^', 1],
        ['ASSIGN', '3%', 1],
        ['ASSIGN', '3=', 1],
        ['ASSIGN', '3++', 2],
        ['ASSIGN', '3--', 2],
        ['ASSIGN', '3**', 2],
        ['ASSIGN', '3//', 2],
        ['ASSIGN', '3^^', 2],
        ['ASSIGN', '3%%', 2],
        ['ASSIGN', '3==', 2],

        ['LPAR', '3#', null],
        ['LPAR', '3!', null],
        ['LPAR', '3)', null],
        ['LPAR', '3*(', null],
        ['LPAR', '3+', null],
        ['LPAR', '3-', null],
        ['LPAR', '3*', null],
        ['LPAR', '3/', null],
        ['LPAR', '3^', null],
        ['LPAR', '3%', null],
        ['LPAR', '3=', null],

        ['RPAR', '3#', null],
        ['RPAR', '3!', null],
        ['RPAR', '3)', null],
        ['RPAR', '3*(', null],
        ['RPAR', '3+', null],
        ['RPAR', '3-', null],
        ['RPAR', '3*', null],
        ['RPAR', '3/', null],
        ['RPAR', '3^', null],
        ['RPAR', '3%', null],
        ['RPAR', '3=', null]
    ])('detects if the new term "%s" must replace the last tokens in "%s"', (token, expression, expected) => {
        const tokens = tokenizer.tokenize(expression);
        expect(applyContextStrategies([...tokens, terms[token]], replaceStrategies)).toStrictEqual(expected);
    });
});
