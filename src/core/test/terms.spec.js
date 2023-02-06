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

import {
    terms,
    types,
    symbols,
    exponent,
    subscript,
    exponentRight,
    exponentLeft,
    subscriptRight,
    isPrefixed
} from '../terms.js';

describe('isPrefixed', () => {
    it('is a helper', () => {
        expect(isPrefixed).toEqual(expect.any(Function));
    });

    it.each([
        ['@nthrt', true],
        ['sqrt', false],
        ['', false]
    ])('tells if %s is prefixed', (value, expected) => {
        expect(isPrefixed(value)).toStrictEqual(expected);
    });
});

describe('exponent', () => {
    it('is a helper', () => {
        expect(exponent).toEqual(expect.any(Function));
    });

    it.each([
        [10, '<sup>10</sup>'],
        [-2, '<sup>-2</sup>'],
        ['text', '<sup>text</sup>']
    ])('formats %s as an exponent', (value, expected) => {
        expect(exponent(value)).toStrictEqual(expected);
    });
});

describe('subscript', () => {
    it('is a helper', () => {
        expect(subscript).toEqual(expect.any(Function));
    });

    it.each([
        [10, '<sub>10</sub>'],
        [-2, '<sub>-2</sub>'],
        ['text', '<sub>text</sub>']
    ])('formats %s as an index', (value, expected) => {
        expect(subscript(value)).toStrictEqual(expected);
    });
});

describe('exponentRight', () => {
    it('is a helper', () => {
        expect(exponentRight).toEqual(expect.any(Function));
    });

    it.each([
        ['x', 10, 'x<sup>10</sup>'],
        [4, -2, '4<sup>-2</sup>'],
        ['log', 'text', 'log<sup>text</sup>']
    ])('formats %s with %s as an exponent on the right', (value, index, expected) => {
        expect(exponentRight(value, index)).toStrictEqual(expected);
    });
});

describe('exponentLeft', () => {
    it('is a helper', () => {
        expect(exponentLeft).toEqual(expect.any(Function));
    });

    it.each([
        ['x', 10, '<sup>10</sup>x'],
        [4, -2, '<sup>-2</sup>4'],
        ['log', 'text', '<sup>text</sup>log']
    ])('formats %s with %s as an exponent on the left', (value, index, expected) => {
        expect(exponentLeft(value, index)).toStrictEqual(expected);
    });
});

describe('subscriptRight', () => {
    it('is a helper', () => {
        expect(subscriptRight).toEqual(expect.any(Function));
    });

    it.each([
        ['x', 10, 'x<sub>10</sub>'],
        [4, -2, '4<sub>-2</sub>'],
        ['log', 'text', 'log<sub>text</sub>']
    ])('formats %s with %s as an index on the right', (value, index, expected) => {
        expect(subscriptRight(value, index)).toStrictEqual(expected);
    });
});

describe('symbols', () => {
    it('is a namespace', () => {
        expect(symbols).toEqual(expect.any(Object));
    });

    it('defines symbols', () => {
        expect(Object.keys(symbols).length).toBeGreaterThan(0);
        expect(symbols).toMatchSnapshot();
    });
});

describe('types', () => {
    it('is a namespace', () => {
        expect(types).toEqual(expect.any(Object));
    });

    it('defines types', () => {
        expect(Object.keys(types).length).toBeGreaterThan(0);
        expect(types).toMatchSnapshot();
    });
});

describe('terms', () => {
    it('is a namespace', () => {
        expect(terms).toEqual(expect.any(Object));
    });

    it('defines terms', () => {
        expect(Object.keys(terms).length).toBeGreaterThan(0);
        expect(terms).toMatchSnapshot();
    });
});
