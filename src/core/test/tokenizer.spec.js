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

import tokenizerFactory from '../tokenizer.js';
import terms from '../terms.js';

describe('tokenizer', () => {
    it('is a factory', () => {
        expect(tokenizerFactory).toEqual(expect.any(Function));
        expect(tokenizerFactory()).toEqual(expect.any(Object));
        expect(tokenizerFactory()).not.toStrictEqual(tokenizerFactory());
    });

    describe('tokenize', () => {
        it('is a function', () => {
            expect(tokenizerFactory().tokenize).toEqual(expect.any(Function));
        });

        it.each([
            ['(.1 + .2) * 10^8 + 4 @nthrt 8e5', void 0],
            [' 3+4 *$foo + sinh 1', void 0],
            [
                ' 3+4 *$foo + sinh PI',
                {
                    symbols: {
                        DOLLAR: '$'
                    },
                    keywords: {
                        FOO: 'foo'
                    }
                }
            ]
        ])('extracts tokens from the expression "%s"', (expression, config) => {
            const tokenizer = tokenizerFactory(config);
            const tokens = tokenizer.tokenize(expression);

            expect(tokens).toMatchSnapshot();
        });

        it('recognize all the registered terms', () => {
            const expression = Object.keys(terms).reduce((expr, id) => `${expr} ${terms[id].value}`, '');

            const tokenizer = tokenizerFactory();
            const tokens = tokenizer.tokenize(expression);

            expect(tokens).toMatchSnapshot();
        });
    });

    describe('iterator', () => {
        it('is a function', () => {
            expect(tokenizerFactory().iterator).toEqual(expect.any(Function));
        });

        it.each([
            ['(.1 + .2) * 10^8 + 4 @nthrt 8e5', void 0],
            [' 3+4 *$foo + sinh 1', void 0],
            [
                ' 3+4 *$foo + sinh PI',
                {
                    symbols: {
                        DOLLAR: '$'
                    },
                    keywords: {
                        FOO: 'foo'
                    }
                }
            ]
        ])('iterates over the terms from the expression "%s"', (expression, config) => {
            const tokenizer = tokenizerFactory(config);
            const next = tokenizer.iterator(expression);

            expect(next).toEqual(expect.any(Function));

            const tokens = [];
            for (let token = next(); token; token = next()) {
                tokens.push(token);
            }

            expect(tokens).toMatchSnapshot();
        });
    });
});
