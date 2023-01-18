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

import terms from '../terms.js';

describe('terms', () => {
    it('is a namespace', () => {
        expect(terms).toEqual(expect.any(Object));
    });

    it('defines terms', () => {
        expect(Object.keys(terms).length).toBeGreaterThan(0);
        expect(terms).toMatchSnapshot();
    });
});
