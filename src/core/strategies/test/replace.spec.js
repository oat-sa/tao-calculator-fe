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

        ['', 'NUM1', null],
        ['', 'NUM1', null],
        ['1', 'NUM1', null],
        ['E', 'NUM1', null],
        ['sin', 'NUM1', null],

        ['3#', 'ADD', null],
        ['3!', 'ADD', null],
        ['3)', 'ADD', null],
        ['3*(', 'ADD', null],
        ['3+', 'ADD', 1],
        ['3-', 'ADD', 1],
        ['3*', 'ADD', 1],
        ['3/', 'ADD', 1],
        ['3^', 'ADD', 1],
        ['3%', 'ADD', 1],
        ['3=', 'ADD', 1],
        ['3++', 'ADD', 2],
        ['3--', 'ADD', 2],
        ['3**', 'ADD', 2],
        ['3//', 'ADD', 2],
        ['3^^', 'ADD', 2],
        ['3%%', 'ADD', 2],
        ['3==', 'ADD', 2],

        ['3#', 'SUB', null],
        ['3!', 'SUB', null],
        ['3)', 'SUB', null],
        ['3*(', 'SUB', null],
        ['3+', 'SUB', 1],
        ['3-', 'SUB', 1],
        ['3*', 'SUB', 0],
        ['3/', 'SUB', 0],
        ['3^', 'SUB', 0],
        ['3%', 'SUB', 0],
        ['3=', 'SUB', 0],
        ['3++', 'SUB', 2],
        ['3--', 'SUB', 2],
        ['3**', 'SUB', 0],
        ['3//', 'SUB', 0],
        ['3^^', 'SUB', 0],
        ['3%%', 'SUB', 0],
        ['3==', 'SUB', 0],

        ['3#', 'MUL', null],
        ['3!', 'MUL', null],
        ['3)', 'MUL', null],
        ['3*(', 'MUL', null],
        ['3+', 'MUL', 1],
        ['3-', 'MUL', 1],
        ['3*', 'MUL', 1],
        ['3/', 'MUL', 1],
        ['3^', 'MUL', 1],
        ['3%', 'MUL', 1],
        ['3=', 'MUL', 1],
        ['3++', 'MUL', 2],
        ['3--', 'MUL', 2],
        ['3**', 'MUL', 2],
        ['3//', 'MUL', 2],
        ['3^^', 'MUL', 2],
        ['3%%', 'MUL', 2],
        ['3==', 'MUL', 2],

        ['3#', 'DIV', null],
        ['3!', 'DIV', null],
        ['3)', 'DIV', null],
        ['3*(', 'DIV', null],
        ['3+', 'DIV', 1],
        ['3-', 'DIV', 1],
        ['3*', 'DIV', 1],
        ['3/', 'DIV', 1],
        ['3^', 'DIV', 1],
        ['3%', 'DIV', 1],
        ['3=', 'DIV', 1],
        ['3++', 'DIV', 2],
        ['3--', 'DIV', 2],
        ['3**', 'DIV', 2],
        ['3//', 'DIV', 2],
        ['3^^', 'DIV', 2],
        ['3%%', 'DIV', 2],
        ['3==', 'DIV', 2],

        ['3#', 'FAC', null],
        ['3!', 'FAC', null],
        ['3)', 'FAC', null],
        ['3*(', 'FAC', null],
        ['3+', 'FAC', 1],
        ['3-', 'FAC', 1],
        ['3*', 'FAC', 1],
        ['3/', 'FAC', 1],
        ['3^', 'FAC', 1],
        ['3%', 'FAC', 1],
        ['3=', 'FAC', 1],
        ['3++', 'FAC', 2],
        ['3--', 'FAC', 2],
        ['3**', 'FAC', 2],
        ['3//', 'FAC', 2],
        ['3^^', 'FAC', 2],
        ['3%%', 'FAC', 2],
        ['3==', 'FAC', 2],

        ['3#', 'PERCENT', null],
        ['3!', 'PERCENT', null],
        ['3)', 'PERCENT', null],
        ['3*(', 'PERCENT', null],
        ['3+', 'PERCENT', 1],
        ['3-', 'PERCENT', 1],
        ['3*', 'PERCENT', 1],
        ['3/', 'PERCENT', 1],
        ['3^', 'PERCENT', 1],
        ['3%', 'PERCENT', 1],
        ['3=', 'PERCENT', 1],
        ['3++', 'PERCENT', 2],
        ['3--', 'PERCENT', 2],
        ['3**', 'PERCENT', 2],
        ['3//', 'PERCENT', 2],
        ['3^^', 'PERCENT', 2],
        ['3%%', 'PERCENT', 2],
        ['3==', 'PERCENT', 2],

        ['3#', 'POW', null],
        ['3!', 'POW', null],
        ['3)', 'POW', null],
        ['3*(', 'POW', null],
        ['3+', 'POW', 1],
        ['3-', 'POW', 1],
        ['3*', 'POW', 1],
        ['3/', 'POW', 1],
        ['3^', 'POW', 1],
        ['3%', 'POW', 1],
        ['3=', 'POW', 1],
        ['3++', 'POW', 2],
        ['3--', 'POW', 2],
        ['3**', 'POW', 2],
        ['3//', 'POW', 2],
        ['3^^', 'POW', 2],
        ['3%%', 'POW', 2],
        ['3==', 'POW', 2],

        ['3#', 'MOD', null],
        ['3!', 'MOD', null],
        ['3)', 'MOD', null],
        ['3*(', 'MOD', null],
        ['3+', 'MOD', 1],
        ['3-', 'MOD', 1],
        ['3*', 'MOD', 1],
        ['3/', 'MOD', 1],
        ['3^', 'MOD', 1],
        ['3%', 'MOD', 1],
        ['3=', 'MOD', 1],
        ['3++', 'MOD', 2],
        ['3--', 'MOD', 2],
        ['3**', 'MOD', 2],
        ['3//', 'MOD', 2],
        ['3^^', 'MOD', 2],
        ['3%%', 'MOD', 2],
        ['3==', 'MOD', 2],

        ['3#', 'ASSIGN', null],
        ['3!', 'ASSIGN', null],
        ['3)', 'ASSIGN', null],
        ['3*(', 'ASSIGN', null],
        ['3+', 'ASSIGN', 1],
        ['3-', 'ASSIGN', 1],
        ['3*', 'ASSIGN', 1],
        ['3/', 'ASSIGN', 1],
        ['3^', 'ASSIGN', 1],
        ['3%', 'ASSIGN', 1],
        ['3=', 'ASSIGN', 1],
        ['3++', 'ASSIGN', 2],
        ['3--', 'ASSIGN', 2],
        ['3**', 'ASSIGN', 2],
        ['3//', 'ASSIGN', 2],
        ['3^^', 'ASSIGN', 2],
        ['3%%', 'ASSIGN', 2],
        ['3==', 'ASSIGN', 2],

        ['3#', 'LPAR', null],
        ['3!', 'LPAR', null],
        ['3)', 'LPAR', null],
        ['3*(', 'LPAR', null],
        ['3+', 'LPAR', null],
        ['3-', 'LPAR', null],
        ['3*', 'LPAR', null],
        ['3/', 'LPAR', null],
        ['3^', 'LPAR', null],
        ['3%', 'LPAR', null],
        ['3=', 'LPAR', null],

        ['3#', 'RPAR', null],
        ['3!', 'RPAR', null],
        ['3)', 'RPAR', null],
        ['3*(', 'RPAR', null],
        ['3+', 'RPAR', null],
        ['3-', 'RPAR', null],
        ['3*', 'RPAR', null],
        ['3/', 'RPAR', null],
        ['3^', 'RPAR', null],
        ['3%', 'RPAR', null],
        ['3=', 'RPAR', null]
    ])('detect if the current token in %s must be replaced by the new term %s', (expression, token, expected) => {
        const tokens = tokenizer.tokenize(expression);
        expect(applyContextStrategies([...tokens, terms[token]], replaceStrategies)).toStrictEqual(expected);
    });
});
