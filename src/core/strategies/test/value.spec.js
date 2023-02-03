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

import { applyValueStrategies, prefixStrategies, suffixStrategies } from '../value.js';

describe('applyValueStrategies', () => {
    it('is a helper', () => {
        expect(applyValueStrategies).toEqual(expect.any(Function));
    });

    it('apply all strategies', () => {
        const strategy1 = jest.fn().mockImplementation(() => false);
        const strategy2 = jest.fn().mockImplementation(() => false);
        const strategies = [
            {
                predicate: strategy1
            },
            {
                predicate: strategy2
            }
        ];

        expect(applyValueStrategies('foo', null, null, strategies)).toEqual('foo');
        expect(strategy1).toHaveBeenCalledTimes(1);
        expect(strategy2).toHaveBeenCalledTimes(1);
    });

    it('apply all strategies until one matches', () => {
        const strategy1 = jest.fn().mockImplementation(() => false);
        const strategy2 = jest.fn().mockImplementation(() => true);
        const strategy3 = jest.fn().mockImplementation(() => false);
        const action = jest.fn().mockImplementation(() => 'bar');
        const strategies = [
            {
                predicate: strategy1
            },
            {
                predicate: strategy2,
                action: action
            },
            {
                predicate: strategy3
            }
        ];

        expect(applyValueStrategies('foo', null, null, strategies)).toEqual('bar');
        expect(strategy1).toHaveBeenCalledTimes(1);
        expect(strategy2).toHaveBeenCalledTimes(1);
        expect(strategy3).toHaveBeenCalledTimes(0);
        expect(action).toHaveBeenCalledTimes(1);
    });
});

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
        ['1', 'RPAR', 'NUM1', '*1'],
        ['cos', 'RPAR', 'COS', '*cos'],
        ['cos', 'NUM1', 'COS', '*cos'],
        ['PI', 'NUM1', 'PI', '*PI'],
        ['1', 'PI', 'NUM1', '*1'],
        ['1', 'COS', 'NUM1', ' 1'],
        ['PI', 'COS', 'PI', ' PI'],
        ['-', 'COS', 'SUB', '-'],
        ['(', 'COS', 'LPAR', '(']
    ])('adds a separator to %s between %s and %s', (value, previous, next, expected) => {
        expect(applyValueStrategies(value, previous, next, prefixStrategies)).toEqual(expected);
    });
});

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
    ])('adds a separator to %s between %s and %s', (value, previous, next, expected) => {
        expect(applyValueStrategies(value, previous, next, suffixStrategies)).toEqual(expected);
    });
});
