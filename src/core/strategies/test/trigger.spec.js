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
import { triggerStrategies } from '../trigger.js';

const tokenizer = tokenizerFactory();

describe('triggerStrategies', () => {
    it('is a collection', () => {
        expect(triggerStrategies).toEqual(expect.any(Array));
        expect(triggerStrategies.length).toBeGreaterThan(0);
        triggerStrategies.forEach(strategy => {
            expect(strategy).toEqual(expect.any(Function));
        });
    });

    describe.each([
        ['', false],
        ['3', false],
        ['123', false],
        ['3+4', true],
        ['1324+246', true],
        ['(1324+246)*23', true],
        ['(1324+246', false],
        ['(1324+246)', true],
        ['(12+3*(98-43)+5!', false],
        ['(12+3*(98-43)+5!)', true],
        ['1324+cos PI', true],
        ['1324+cos', false],
        ['1324+cos-', false],
        ['4 @nthrt', false],
        ['4 @nthrt 189', true],
        ['50#', false],
        ['10+50#', true],
        ['50#*3', true]
    ])('detects if the expression "%s" should be evaluated', (expression, allowed) => {
        it.each([
            ['', false],
            ['NEG', true],
            ['SUB', true],
            ['POS', true],
            ['ADD', true],
            ['MUL', true],
            ['DIV', true],
            ['MOD', true],
            ['POW', true],
            ['FAC', false],
            ['ASSIGN', false],
            ['PERCENT', false],
            ['NTHRT', true],
            ['LPAR', false],
            ['RPAR', false],
            ['COMMA', false],
            ['SIN', false],
            ['NUM3', false],
            ['VAR_ANS', false],
            ['PI', false]
        ])('before adding the token "%s"', (token, trigger) => {
            const tokens = tokenizer.tokenize(expression);
            const expected = allowed && trigger;

            expect(applyContextStrategies([...tokens, terms[token]], triggerStrategies)).toStrictEqual(expected);
        });
    });
});
