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
import { replaceExpressionStrategies } from '../replaceExpression.js';

const tokenizer = tokenizerFactory();

describe('replaceExpressionStrategies', () => {
    it('is a collection', () => {
        expect(replaceExpressionStrategies).toEqual(expect.any(Array));
        expect(replaceExpressionStrategies.length).toBeGreaterThan(0);
        replaceExpressionStrategies.forEach(strategy => {
            expect(strategy).toEqual(expect.any(Function));
        });
    });

    describe.each(['NUM1', 'SIN', 'SQRT', 'LPAR'])(
        'the expression must be replaced when adding the token "%s"',
        token => {
            it.each(['ans', '0'])('to "%s"', expression => {
                const tokens = tokenizer.tokenize(expression);
                expect(applyContextStrategies([...tokens, terms[token]], replaceExpressionStrategies)).toBeTruthy();
            });
        }
    );

    it('the expression will not be replaced when adding the token "DOT" to "0"', () => {
        const tokens = tokenizer.tokenize('0');
        expect(applyContextStrategies([...tokens, terms.DOT], replaceExpressionStrategies)).toBeFalsy();
    });

    describe.each(['ADD', 'FAC', 'NTHRT'])('the expression will not be replaced when adding the token "%s"', token => {
        it.each(['ans', '0', '3+2', '+'])('to "%s"', expression => {
            const tokens = tokenizer.tokenize(expression);
            expect(applyContextStrategies([...tokens, terms[token]], replaceExpressionStrategies)).toBeFalsy();
        });
    });
});
