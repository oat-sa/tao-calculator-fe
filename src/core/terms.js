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

import __ from '../util/i18n.js';

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
 * @property {string} description - A description of what represent the term
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
        type: 'digit',
        description: __('Digit 0'),
        exponent: false
    },
    NUM1: {
        label: '1',
        value: '1',
        type: 'digit',
        description: __('Digit 1'),
        exponent: false
    },
    NUM2: {
        label: '2',
        value: '2',
        type: 'digit',
        description: __('Digit 2'),
        exponent: false
    },
    NUM3: {
        label: '3',
        value: '3',
        type: 'digit',
        description: __('Digit 3'),
        exponent: false
    },
    NUM4: {
        label: '4',
        value: '4',
        type: 'digit',
        description: __('Digit 4'),
        exponent: false
    },
    NUM5: {
        label: '5',
        value: '5',
        type: 'digit',
        description: __('Digit 5'),
        exponent: false
    },
    NUM6: {
        label: '6',
        value: '6',
        type: 'digit',
        description: __('Digit 6'),
        exponent: false
    },
    NUM7: {
        label: '7',
        value: '7',
        type: 'digit',
        description: __('Digit 7'),
        exponent: false
    },
    NUM8: {
        label: '8',
        value: '8',
        type: 'digit',
        description: __('Digit 8'),
        exponent: false
    },
    NUM9: {
        label: '9',
        value: '9',
        type: 'digit',
        description: __('Digit 9'),
        exponent: false
    },
    DOT: {
        label: '.',
        value: '.',
        type: 'digit',
        description: __('Dot'),
        exponent: false
    },
    EXP10: {
        label: `${symbols.multiply}10`,
        value: 'e',
        type: 'digit',
        description: __('Power of 10'),
        exponent: 'right'
    },

    // Aggregators
    LPAR: {
        label: '(',
        value: '(',
        type: 'aggregator',
        description: __('Left parenthesis'),
        exponent: false
    },
    RPAR: {
        label: ')',
        value: ')',
        type: 'aggregator',
        description: __('Right parenthesis'),
        exponent: false
    },

    // Separator
    COMMA: {
        label: ',',
        value: ',',
        type: 'separator',
        description: __('Arguments separator'),
        exponent: false
    },
    ELLIPSIS: {
        label: symbols.ellipsis,
        value: '~',
        type: 'separator',
        description: __('Value ellipsis'),
        exponent: false
    },

    // Operators
    SUB: {
        label: symbols.minus,
        value: '-',
        type: 'operator',
        description: __('Binary operator -'),
        exponent: false
    },
    NEG: {
        label: symbols.negative,
        value: '-',
        type: 'operator',
        description: __('Unary operator -'),
        exponent: false
    },
    ADD: {
        label: symbols.plus,
        value: '+',
        type: 'operator',
        description: __('Binary operator +'),
        exponent: false
    },
    POS: {
        label: symbols.positive,
        value: '+',
        type: 'operator',
        description: __('Unary operator +'),
        exponent: false
    },
    MUL: {
        label: symbols.multiply,
        value: '*',
        type: 'operator',
        description: __('Binary operator *'),
        exponent: false
    },
    DIV: {
        label: symbols.divide,
        value: '/',
        type: 'operator',
        description: __('Binary operator /'),
        exponent: false
    },
    MOD: {
        label: __('modulo'),
        value: '%',
        type: 'operator',
        description: __('Binary operator modulo'),
        exponent: false
    },
    POW: {
        label: '^',
        value: '^',
        type: 'operator',
        description: __('Power of'),
        exponent: 'right'
    },
    FAC: {
        label: '!',
        value: '!',
        type: 'operator',
        description: __('Factorial'),
        exponent: false
    },
    ASSIGN: {
        label: '=',
        value: '=',
        type: 'operator',
        description: __('Assign'),
        exponent: false
    },

    // Variables
    ANS: {
        label: __('Ans'),
        value: 'ans',
        type: 'variable',
        description: __('Last result'),
        exponent: false
    },

    // Constants
    PI: {
        label: symbols.pi,
        value: 'PI',
        type: 'constant',
        description: __('Value of PI'),
        exponent: false
    },
    E: {
        label: 'e',
        value: 'E',
        type: 'constant',
        description: __('Value of E'),
        exponent: false
    },

    // Errors
    NAN: {
        label: __('Error'),
        value: 'NaN',
        type: 'error',
        description: __('Error in value'),
        exponent: false
    },
    INFINITY: {
        label: __('Infinity'),
        value: 'Infinity',
        type: 'error',
        description: __('Error in result'),
        exponent: false
    },
    ERROR: {
        label: __('Syntax error'),
        value: '#',
        type: 'error',
        description: __('Error in syntax'),
        exponent: false
    },

    // Functions
    EXP: {
        label: 'exp',
        value: 'exp',
        type: 'function',
        description: __('Exponent'),
        exponent: 'right'
    },
    SQRT: {
        label: symbols.squareRoot,
        value: 'sqrt',
        type: 'function',
        description: __('Square root'),
        exponent: false
    },
    CBRT: {
        label: exponentRight(symbols.squareRoot, '3'),
        value: 'cbrt',
        type: 'function',
        description: __('Cube root'),
        exponent: false
    },
    NTHRT: {
        label: exponentRight(symbols.squareRoot, 'x'),
        value: 'nthrt',
        type: 'function',
        description: __('Nth root'),
        exponent: 'left'
    },
    FLOOR: {
        label: 'floor',
        value: 'floor',
        type: 'function',
        description: __('Round to lower whole number'),
        exponent: false
    },
    CEIL: {
        label: 'ceil',
        value: 'ceil',
        type: 'function',
        description: __('Round to upper whole number'),
        exponent: false
    },
    ROUND: {
        label: 'round',
        value: 'round',
        type: 'function',
        description: __('Round to closest whole number'),
        exponent: false
    },
    TRUNC: {
        label: 'trunc',
        value: 'trunc',
        type: 'function',
        description: __('Whole number part'),
        exponent: false
    },
    SIN: {
        label: 'sin',
        value: 'sin',
        type: 'function',
        description: __('Sine'),
        exponent: false
    },
    COS: {
        label: 'cos',
        value: 'cos',
        type: 'function',
        description: __('Cosine'),
        exponent: false
    },
    TAN: {
        label: 'tan',
        value: 'tan',
        type: 'function',
        description: __('Tangent'),
        exponent: false
    },
    ASIN: {
        label: exponentLeft('sin', symbols.minusOne),
        value: 'asin',
        type: 'function',
        description: __('Arc sine'),
        exponent: false
    },
    ACOS: {
        label: exponentLeft('cos', symbols.minusOne),
        value: 'acos',
        type: 'function',
        description: __('Arc cosine'),
        exponent: false
    },
    ATAN: {
        label: exponentLeft('tan', symbols.minusOne),
        value: 'atan',
        type: 'function',
        description: __('Arc tangent'),
        exponent: false
    },
    SINH: {
        label: 'sinh',
        value: 'sinh',
        type: 'function',
        description: __('Hyperbolic sine'),
        exponent: false
    },
    COSH: {
        label: 'cosh',
        value: 'cosh',
        type: 'function',
        description: __('Hyperbolic cosine'),
        exponent: false
    },
    TANH: {
        label: 'tanh',
        value: 'tanh',
        type: 'function',
        description: __('Hyperbolic tangent'),
        exponent: false
    },
    ASINH: {
        label: exponentLeft('sinh', symbols.minusOne),
        value: 'asinh',
        type: 'function',
        description: __('Hyperbolic arc sine'),
        exponent: false
    },
    ACOSH: {
        label: exponentLeft('cosh', symbols.minusOne),
        value: 'acosh',
        type: 'function',
        description: __('Hyperbolic arc cosine'),
        exponent: false
    },
    ATANH: {
        label: exponentLeft('tanh', symbols.minusOne),
        value: 'atanh',
        type: 'function',
        description: __('Hyperbolic arc tangent'),
        exponent: false
    },
    LN: {
        label: 'ln',
        value: 'ln',
        type: 'function',
        description: __('Natural logarithm'),
        exponent: false
    },
    LOG: {
        label: 'ln',
        value: 'log',
        type: 'function',
        description: __('Natural logarithm'),
        exponent: false
    },
    LG: {
        label: subscriptLeft('log', '10'),
        value: 'lg',
        type: 'function',
        description: __('Base-10 logarithm'),
        exponent: false
    },
    LOG10: {
        label: subscriptLeft('log', '10'),
        value: 'log10',
        type: 'function',
        description: __('Base-10 logarithm'),
        exponent: false
    },
    ABS: {
        label: 'abs',
        value: 'abs',
        type: 'function',
        description: __('Absolute value'),
        exponent: false
    },
    RAND: {
        label: 'random',
        value: 'random',
        type: 'function',
        description: __('Random value'),
        exponent: false
    }
};
