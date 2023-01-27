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
 * Copyright (c) 2018-2023 Open Assessment Technologies SA ;
 */

import types from './types.js';

const exponent = x => `<sup>${x}</sup>`;
const exponentLeft = (a, x) => a + exponent(x);
const exponentRight = (a, x) => exponent(x) + a;
const subscript = x => `<sub>${x}</sub>`;
const subscriptLeft = (a, x) => a + subscript(x);
const symbols = {
    minusOne: '\uFE631',
    minus: '\uFF0D',
    plus: '\uFF0B',
    positive: '\uFE62',
    negative: '\uFE63',
    multiply: '\u00D7',
    divide: '\u00F7',
    squareRoot: '\u221A',
    cubeRoot: '\u221B',
    fourthRoot: '\u221C',
    ellipsis: '\u2026',
    pi: '\u03C0'
};

/**
 * @typedef {object} term - Represents a tokenizable term
 * @property {string} label - The displayable text
 * @property {string} value - The related text that should be found in the expression
 * @property {string} type - The type of token
 * @property {string|boolean} exponent - Some terms introduce exponent notation, and this property tells on which side
 */

/**
 * Defines the terms that can be tokenized from an expression
 * @type {term[]}
 */
export default {
    // Digits definition
    NUM0: {
        label: '0',
        value: '0',
        type: types.digit,
        exponent: false
    },
    NUM1: {
        label: '1',
        value: '1',
        type: types.digit,
        exponent: false
    },
    NUM2: {
        label: '2',
        value: '2',
        type: types.digit,
        exponent: false
    },
    NUM3: {
        label: '3',
        value: '3',
        type: types.digit,
        exponent: false
    },
    NUM4: {
        label: '4',
        value: '4',
        type: types.digit,
        exponent: false
    },
    NUM5: {
        label: '5',
        value: '5',
        type: types.digit,
        exponent: false
    },
    NUM6: {
        label: '6',
        value: '6',
        type: types.digit,
        exponent: false
    },
    NUM7: {
        label: '7',
        value: '7',
        type: types.digit,
        exponent: false
    },
    NUM8: {
        label: '8',
        value: '8',
        type: types.digit,
        exponent: false
    },
    NUM9: {
        label: '9',
        value: '9',
        type: types.digit,
        exponent: false
    },
    DOT: {
        label: '.',
        value: '.',
        type: types.digit,
        exponent: false
    },
    EXP10: {
        label: `${symbols.multiply}10`,
        value: 'e',
        type: types.digit,
        exponent: 'right'
    },

    // Aggregators
    LPAR: {
        label: '(',
        value: '(',
        type: types.aggregator,
        exponent: false
    },
    RPAR: {
        label: ')',
        value: ')',
        type: types.aggregator,
        exponent: false
    },

    // Separator
    COMMA: {
        label: ',',
        value: ',',
        type: types.separator,
        exponent: false
    },
    ELLIPSIS: {
        label: symbols.ellipsis,
        value: '~',
        type: types.separator,
        exponent: false
    },

    // Operators
    SUB: {
        label: symbols.minus,
        value: '-',
        type: types.operator,
        exponent: false
    },
    NEG: {
        label: symbols.negative,
        value: '-',
        type: types.operator,
        exponent: false
    },
    ADD: {
        label: symbols.plus,
        value: '+',
        type: types.operator,
        exponent: false
    },
    POS: {
        label: symbols.positive,
        value: '+',
        type: types.operator,
        exponent: false
    },
    MUL: {
        label: symbols.multiply,
        value: '*',
        type: types.operator,
        exponent: false
    },
    DIV: {
        label: symbols.divide,
        value: '/',
        type: types.operator,
        exponent: false
    },
    MOD: {
        label: 'modulo',
        value: '%',
        type: types.operator,
        exponent: false
    },
    POW: {
        label: '^',
        value: '^',
        type: types.operator,
        exponent: 'right'
    },
    FAC: {
        label: '!',
        value: '!',
        type: types.operator,
        exponent: false
    },
    ASSIGN: {
        label: '=',
        value: '=',
        type: types.operator,
        exponent: false
    },

    // Variables
    ANS: {
        label: 'Ans',
        value: 'ans',
        type: types.variable,
        exponent: false
    },

    // Constants
    PI: {
        label: symbols.pi,
        value: 'PI',
        type: types.constant,
        exponent: false
    },
    E: {
        label: 'e',
        value: 'E',
        type: types.constant,
        exponent: false
    },

    // Errors
    NAN: {
        label: 'Error',
        value: 'NaN',
        type: types.error,
        exponent: false
    },
    INFINITY: {
        label: 'Infinity',
        value: 'Infinity',
        type: types.error,
        exponent: false
    },
    ERROR: {
        label: 'Syntax error',
        value: '#',
        type: types.error,
        exponent: false
    },

    // Functions
    EXP: {
        label: 'exp',
        value: 'exp',
        type: types.function,
        exponent: 'right'
    },
    SQRT: {
        label: symbols.squareRoot,
        value: 'sqrt',
        type: types.function,
        exponent: false
    },
    CBRT: {
        label: exponentRight(symbols.squareRoot, '3'),
        value: 'cbrt',
        type: types.function,
        exponent: false
    },
    NTHRT: {
        label: exponentRight(symbols.squareRoot, 'x'),
        value: 'nthrt',
        type: types.function,
        exponent: 'left'
    },
    FLOOR: {
        label: 'floor',
        value: 'floor',
        type: types.function,
        exponent: false
    },
    CEIL: {
        label: 'ceil',
        value: 'ceil',
        type: types.function,
        exponent: false
    },
    ROUND: {
        label: 'round',
        value: 'round',
        type: types.function,
        exponent: false
    },
    TRUNC: {
        label: 'trunc',
        value: 'trunc',
        type: types.function,
        exponent: false
    },
    SIN: {
        label: 'sin',
        value: 'sin',
        type: types.function,
        exponent: false
    },
    COS: {
        label: 'cos',
        value: 'cos',
        type: types.function,
        exponent: false
    },
    TAN: {
        label: 'tan',
        value: 'tan',
        type: types.function,
        exponent: false
    },
    ASIN: {
        label: exponentLeft('sin', symbols.minusOne),
        value: 'asin',
        type: types.function,
        exponent: false
    },
    ACOS: {
        label: exponentLeft('cos', symbols.minusOne),
        value: 'acos',
        type: types.function,
        exponent: false
    },
    ATAN: {
        label: exponentLeft('tan', symbols.minusOne),
        value: 'atan',
        type: types.function,
        exponent: false
    },
    SINH: {
        label: 'sinh',
        value: 'sinh',
        type: types.function,
        exponent: false
    },
    COSH: {
        label: 'cosh',
        value: 'cosh',
        type: types.function,
        exponent: false
    },
    TANH: {
        label: 'tanh',
        value: 'tanh',
        type: types.function,
        exponent: false
    },
    ASINH: {
        label: exponentLeft('sinh', symbols.minusOne),
        value: 'asinh',
        type: types.function,
        exponent: false
    },
    ACOSH: {
        label: exponentLeft('cosh', symbols.minusOne),
        value: 'acosh',
        type: types.function,
        exponent: false
    },
    ATANH: {
        label: exponentLeft('tanh', symbols.minusOne),
        value: 'atanh',
        type: types.function,
        exponent: false
    },
    LN: {
        label: 'ln',
        value: 'ln',
        type: types.function,
        exponent: false
    },
    LOG: {
        label: 'ln',
        value: 'log',
        type: types.function,
        exponent: false
    },
    LG: {
        label: subscriptLeft('log', '10'),
        value: 'lg',
        type: types.function,
        exponent: false
    },
    LOG10: {
        label: subscriptLeft('log', '10'),
        value: 'log10',
        type: types.function,
        exponent: false
    },
    ABS: {
        label: 'abs',
        value: 'abs',
        type: types.function,
        exponent: false
    },
    RAND: {
        label: 'random',
        value: 'random',
        type: types.function,
        exponent: false
    }
};
