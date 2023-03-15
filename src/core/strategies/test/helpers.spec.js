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
 * Copyright (c) 2023 (original work) Open Assessment Technologies SA ;
 */

import { applyTokenStrategies, applyValueStrategies } from '../helpers.js';

describe('applyTokenStrategies', () => {
    it('is a helper', () => {
        expect(applyTokenStrategies).toEqual(expect.any(Function));
    });

    it('apply all strategies', () => {
        const strategy1 = jest.fn().mockImplementation(() => null);
        const strategy2 = jest.fn().mockImplementation(() => null);
        const strategies = [strategy1, strategy2];

        expect(applyTokenStrategies(null, null, strategies)).toBeNull();
        expect(strategy1).toHaveBeenCalledTimes(1);
        expect(strategy2).toHaveBeenCalledTimes(1);
    });

    it('apply all strategies until one matches', () => {
        const result = {};
        const strategy1 = jest.fn().mockImplementation(() => null);
        const strategy2 = jest.fn().mockImplementation(() => result);
        const strategy3 = jest.fn().mockImplementation(() => null);
        const strategies = [strategy1, strategy2, strategy3];

        expect(applyTokenStrategies(null, null, strategies)).toBe(result);
        expect(strategy1).toHaveBeenCalledTimes(1);
        expect(strategy2).toHaveBeenCalledTimes(1);
        expect(strategy3).toHaveBeenCalledTimes(0);
    });
});

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
