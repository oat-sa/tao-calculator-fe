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

    describe.each([
        '',
        'NUM1',
        'ADD',
        'SUB',
        'MUL',
        'DIV',
        'NTHRT',
        'FAC',
        'PERCENT',
        'POW',
        'MOD',
        'ASSIGN',
        'LPAR',
        'RPAR'
    ])('accepts adding the token "%s"', token => {
        it.each(['', '1', 'E', 'sin', '3#', '3!', '3)', '3*('])('to "%s"', expression => {
            const tokens = tokenizer.tokenize(expression);
            expect(applyContextStrategies([...tokens, terms[token]], replaceStrategies)).toBeNull();
        });
    });

    describe.each(['SUB'])('replaces the last operator when adding the token "%s"', token => {
        it.each([
            ['3+', 1],
            ['3-', 1],
            ['3*', 0],
            ['3/', 0],
            ['3^', 0],
            ['3%', 0],
            ['3=', 0],
            ['3@nthrt', 0],
            ['3++', 2],
            ['3--', 2],
            ['3**', 0],
            ['3//', 0],
            ['3^^', 0],
            ['3%%', 0],
            ['3==', 0]
        ])('to "%s"', (expression, expected) => {
            const tokens = tokenizer.tokenize(expression);
            expect(applyContextStrategies([...tokens, terms[token]], replaceStrategies)).toStrictEqual(expected);
        });
    });

    describe.each(['ADD', 'MUL', 'DIV', 'NTHRT', 'FAC', 'PERCENT', 'POW', 'MOD', 'ASSIGN'])(
        'replaces the last operator when adding the token "%s"',
        token => {
            it.each(['3+', '3-', '3*', '3/', '3^', '3%', '3=', '3@nthrt'])('to "%s"', expression => {
                const tokens = tokenizer.tokenize(expression);
                expect(applyContextStrategies([...tokens, terms[token]], replaceStrategies)).toStrictEqual(1);
            });
        }
    );

    describe.each(['ADD', 'MUL', 'DIV', 'NTHRT', 'FAC', 'PERCENT', 'POW', 'MOD', 'ASSIGN'])(
        'replaces the last operators when adding the token "%s"',
        token => {
            it.each(['3++', '3--', '3**', '3//', '3^^', '3%%', '3==', '3@nthrt@nthrt'])('to "%s"', expression => {
                const tokens = tokenizer.tokenize(expression);
                expect(applyContextStrategies([...tokens, terms[token]], replaceStrategies)).toStrictEqual(2);
            });
        }
    );

    describe.each(['LPAR', 'RPAR'])('accepts adding the token "%s"', token => {
        it.each(['3+', '3-', '3*', '3/', '3^', '3%', '3=', '3@nthrt'])('to "%s"', expression => {
            const tokens = tokenizer.tokenize(expression);
            expect(applyContextStrategies([...tokens, terms[token]], replaceStrategies)).toBeNull();
        });
    });
});
