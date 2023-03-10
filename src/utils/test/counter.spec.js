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

import { counterFactory } from '../counter.js';

describe('counter', () => {
    it('is a factory', () => {
        expect(counterFactory).toEqual(expect.any(Function));
        expect(counterFactory()).toEqual(expect.any(Object));
        expect(counterFactory()).not.toStrictEqual(counterFactory());
    });

    it('has a count property', () => {
        const counter = counterFactory();
        expect(counter.count).toStrictEqual(0);
    });

    it('does not count state changes from false to true', () => {
        const counter = counterFactory();
        expect(counter.count).toStrictEqual(0);
        counter.check(true);
        expect(counter.count).toStrictEqual(0);
    });

    it('count state changes from true to false', () => {
        const counter = counterFactory();
        expect(counter.count).toStrictEqual(0);
        counter.check(true);
        counter.check(false);
        expect(counter.count).toStrictEqual(1);
    });
});
