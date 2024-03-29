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
    exponent,
    exponentLeft,
    exponentRight,
    functionOperators,
    isFunctionOperator,
    isPrefixedTerm,
    isSignOperator,
    signOperators,
    subscript,
    subscriptRight,
    symbols,
    terms,
    types
} from '../terms.js';

describe('isPrefixedTerm', () => {
    it('is a helper', () => {
        expect(isPrefixedTerm).toEqual(expect.any(Function));
    });

    it.each([
        ['@nthrt', true],
        ['sqrt', false],
        ['', false]
    ])('tells if %s is prefixed', (value, expected) => {
        expect(isPrefixedTerm(value)).toStrictEqual(expected);
    });
});

describe('isSignOperator', () => {
    it('is a helper', () => {
        expect(isSignOperator).toEqual(expect.any(Function));
    });

    it.each([
        ['', false],
        ['MUL', false],
        ['NEG', true],
        ['SUB', true],
        ['POS', true],
        ['ADD', true]
    ])('tells if %s is a sign operator', (value, expected) => {
        expect(isSignOperator(value)).toStrictEqual(expected);
    });
});

describe('isFunctionOperator', () => {
    it('is a helper', () => {
        expect(isFunctionOperator).toEqual(expect.any(Function));
    });

    it.each([
        ['', false],
        ['MUL', false],
        ['SUB', false],
        ['ADD', false],
        ['NTHRT', true]
    ])('tells if %s is a function operator', (value, expected) => {
        expect(isFunctionOperator(value)).toStrictEqual(expected);
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
        Object.keys(symbols).forEach(name => {
            expect(symbols[name]).toEqual(expect.any(String));
        });
    });
});

describe('types', () => {
    it('is a namespace', () => {
        expect(types).toEqual(expect.any(Object));
    });

    it('defines types', () => {
        expect(Object.keys(types).length).toBeGreaterThan(0);
        Object.keys(types).forEach(name => {
            expect(types[name]).toStrictEqual(name);
        });
    });
});

describe('signOperators', () => {
    it('is a namespace', () => {
        expect(signOperators).toEqual(expect.any(Array));
    });

    it('defines tokens', () => {
        expect(signOperators.length).toBeGreaterThan(0);
        signOperators.forEach(name => {
            expect(terms[name]).toEqual(expect.any(Object));
        });
    });
});

describe('functionOperators', () => {
    it('is a namespace', () => {
        expect(functionOperators).toEqual(expect.any(Array));
    });

    it('defines tokens', () => {
        expect(functionOperators.length).toBeGreaterThan(0);
        functionOperators.forEach(name => {
            expect(terms[name]).toEqual(expect.any(Object));
        });
    });
});

describe('terms', () => {
    it('is a namespace', () => {
        expect(terms).toEqual(expect.any(Object));
    });

    it('defines terms', () => {
        expect(Object.keys(terms).length).toBeGreaterThan(0);
        Object.keys(terms).forEach(token => {
            const term = terms[token];
            expect(term.label).toEqual(expect.any(String));
            expect(term.value).toEqual(expect.any(String));
            expect(types[term.type]).toEqual(expect.any(String));
            expect(term.token).toStrictEqual(token);
        });
    });
});
