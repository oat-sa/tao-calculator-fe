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

/**
 * Regex that matches the prefixed function operators
 * @type {RegExp}
 */
const rePrefixedTerm = /^@[a-zA-Z_]\w*$/;

/**
 * Tells if a term is prefixed for turning a function into a binary operator.
 * This allows using a function like `nthrt(x, y)` as `x @nthrt y`.
 * This tweak simplifies the expression's renderer.
 * @param {string} name - The term to check.
 * @returns {boolean} - Returns `true` if the term is prefixed.
 */
export const isFunctionOperator = name => rePrefixedTerm.test(name);

/**
 * Formats a math element as exponent.
 * @param {string} x - The value to place as exponent
 * @returns {string}
 */
export const exponent = x => `<sup>${x}</sup>`;

/**
 * Formats a math element as index.
 * @param {string} x - The value to place as index
 * @returns {string}
 */
export const subscript = x => `<sub>${x}</sub>`;

/**
 * Formats a math element with a value as exponent on the right side.
 * @param {string} a - The math element
 * @param {string} x - The value to place as exponent
 * @returns {string}
 */
export const exponentRight = (a, x) => a + exponent(x);

/**
 * Formats a math element with a value as exponent on the left side.
 * @param {string} a - The math element
 * @param {string} x - The value to place as exponent
 * @returns {string}
 */
export const exponentLeft = (a, x) => exponent(x) + a;

/**
 * Formats a math element with a value as index on the right side.
 * @param {string} a - The math element
 * @param {string} x - The value to place as index
 * @returns {string}
 */
export const subscriptRight = (a, x) => a + subscript(x);

/**
 * Defines the symbols for some maths elements.
 * @type {object}
 */
export const symbols = {
    minusOne: '\uFE631',
    minus: '\u2212',
    plus: '\u002B',
    positive: '+',
    negative: '-',
    multiply: '\u00D7',
    divide: '\u00F7',
    squareRoot: '\u221A',
    cubeRoot: '\u221B',
    fourthRoot: '\u221C',
    ellipsis: '\u2026',
    pi: '\u03C0',
    euler: 'e'
};

/**
 * Defines the types of tokens that can be represented in an expression.
 * @type {object}
 */
export const types = {
    term: 'term',
    digit: 'digit',
    aggregator: 'aggregator',
    separator: 'separator',
    operator: 'operator',
    unary: 'unary',
    variable: 'variable',
    constant: 'constant',
    function: 'function',
    exponent: 'exponent',
    unknown: 'unknown',
    error: 'error'
};

/**
 * @typedef {object} term - Represents a tokenizable term
 * @property {string} label - The displayable text
 * @property {string} value - The related text that should be found in the expression
 * @property {string} type - The type of token
 * @property {string} token - The token name
 * @property {boolean} unary - Tells if the operator is unary or binary
 * @property {string|boolean} exponent - Some terms introduce exponent notation, and this property tells on which side
 */

/**
 * Defines the terms that can be tokenized from an expression
 * @type {term[]}
 */
export const terms = {
    // Digits definition
    NUM0: {
        label: '0',
        value: '0',
        type: types.digit,
        token: 'NUM0',
        exponent: false
    },
    NUM1: {
        label: '1',
        value: '1',
        type: types.digit,
        token: 'NUM1',
        exponent: false
    },
    NUM2: {
        label: '2',
        value: '2',
        type: types.digit,
        token: 'NUM2',
        exponent: false
    },
    NUM3: {
        label: '3',
        value: '3',
        type: types.digit,
        token: 'NUM3',
        exponent: false
    },
    NUM4: {
        label: '4',
        value: '4',
        type: types.digit,
        token: 'NUM4',
        exponent: false
    },
    NUM5: {
        label: '5',
        value: '5',
        type: types.digit,
        token: 'NUM5',
        exponent: false
    },
    NUM6: {
        label: '6',
        value: '6',
        type: types.digit,
        token: 'NUM6',
        exponent: false
    },
    NUM7: {
        label: '7',
        value: '7',
        type: types.digit,
        token: 'NUM7',
        exponent: false
    },
    NUM8: {
        label: '8',
        value: '8',
        type: types.digit,
        token: 'NUM8',
        exponent: false
    },
    NUM9: {
        label: '9',
        value: '9',
        type: types.digit,
        token: 'NUM9',
        exponent: false
    },
    DOT: {
        label: '.',
        value: '.',
        type: types.digit,
        token: 'DOT',
        exponent: false
    },
    EXP10: {
        label: `${symbols.multiply}10`,
        value: 'e',
        type: types.digit,
        token: 'EXP10',
        exponent: 'right'
    },

    // Aggregators
    LPAR: {
        label: '(',
        value: '(',
        type: types.aggregator,
        token: 'LPAR',
        exponent: false
    },
    RPAR: {
        label: ')',
        value: ')',
        type: types.aggregator,
        token: 'RPAR',
        exponent: false
    },

    // Separator
    COMMA: {
        label: ',',
        value: ',',
        type: types.separator,
        token: 'COMMA',
        exponent: false
    },
    ELLIPSIS: {
        label: symbols.ellipsis,
        value: '~',
        type: types.separator,
        token: 'ELLIPSIS',
        exponent: false
    },

    // Operators
    SUB: {
        label: symbols.minus,
        value: '-',
        type: types.operator,
        token: 'SUB',
        exponent: false
    },
    NEG: {
        label: symbols.negative,
        value: '-',
        type: types.operator,
        token: 'NEG',
        exponent: false
    },
    ADD: {
        label: symbols.plus,
        value: '+',
        type: types.operator,
        token: 'ADD',
        exponent: false
    },
    POS: {
        label: symbols.positive,
        value: '+',
        type: types.operator,
        token: 'POS',
        exponent: false
    },
    MUL: {
        label: symbols.multiply,
        value: '*',
        type: types.operator,
        token: 'MUL',
        exponent: false
    },
    DIV: {
        label: symbols.divide,
        value: '/',
        type: types.operator,
        token: 'DIV',
        exponent: false
    },
    MOD: {
        label: 'modulo',
        value: '%',
        type: types.operator,
        token: 'MOD',
        exponent: false
    },
    POW: {
        label: '^',
        value: '^',
        type: types.operator,
        token: 'POW',
        exponent: 'right'
    },
    FAC: {
        label: '!',
        value: '!',
        type: types.unary,
        token: 'FAC',
        exponent: false
    },
    ASSIGN: {
        label: '=',
        value: '=',
        type: types.operator,
        token: 'ASSIGN',
        exponent: false
    },
    PERCENT: {
        label: '%',
        value: '#',
        type: types.unary,
        token: 'PERCENT',
        exponent: false
    },

    // Variables
    VAR_ANS: {
        label: 'Ans',
        value: 'ans',
        type: types.variable,
        token: 'VAR_ANS',
        exponent: false
    },
    VAR_MEM: {
        label: 'Mem',
        value: 'mem',
        type: types.variable,
        token: 'VAR_MEM',
        exponent: false
    },

    // Constants
    PI: {
        label: symbols.pi,
        value: 'PI',
        type: types.constant,
        token: 'PI',
        exponent: false
    },
    E: {
        label: symbols.euler,
        value: 'E',
        type: types.constant,
        token: 'E',
        exponent: false
    },
    TEN: {
        label: '10',
        value: 'TEN',
        type: types.constant,
        token: 'TEN',
        exponent: false
    },

    // Errors
    NAN: {
        label: 'Error',
        value: 'NaN',
        type: types.error,
        token: 'NAN',
        exponent: false
    },
    INFINITY: {
        label: 'Infinity',
        value: 'Infinity',
        type: types.error,
        token: 'INFINITY',
        exponent: false
    },
    ERROR: {
        label: 'Syntax error',
        value: 'Syntax',
        type: types.error,
        token: 'ERROR',
        exponent: false
    },

    // Functions
    EXP: {
        label: 'exp',
        value: 'exp',
        type: types.function,
        token: 'EXP',
        exponent: 'right'
    },
    SQRT: {
        label: symbols.squareRoot,
        value: 'sqrt',
        type: types.function,
        token: 'SQRT',
        exponent: false
    },
    CBRT: {
        label: exponentLeft(symbols.squareRoot, '3'),
        value: 'cbrt',
        type: types.function,
        token: 'CBRT',
        exponent: false
    },
    NTHRT: {
        label: symbols.squareRoot,
        value: 'nthrt',
        type: types.function,
        token: 'NTHRT',
        exponent: 'left'
    },
    FLOOR: {
        label: 'floor',
        value: 'floor',
        type: types.function,
        token: 'FLOOR',
        exponent: false
    },
    CEIL: {
        label: 'ceil',
        value: 'ceil',
        type: types.function,
        token: 'CEIL',
        exponent: false
    },
    ROUND: {
        label: 'round',
        value: 'round',
        type: types.function,
        token: 'ROUND',
        exponent: false
    },
    TRUNC: {
        label: 'trunc',
        value: 'trunc',
        type: types.function,
        token: 'TRUNC',
        exponent: false
    },
    SIN: {
        label: 'sin',
        value: 'sin',
        type: types.function,
        token: 'SIN',
        exponent: false
    },
    COS: {
        label: 'cos',
        value: 'cos',
        type: types.function,
        token: 'COS',
        exponent: false
    },
    TAN: {
        label: 'tan',
        value: 'tan',
        type: types.function,
        token: 'TAN',
        exponent: false
    },
    ASIN: {
        label: exponentRight('sin', symbols.minusOne),
        value: 'asin',
        type: types.function,
        token: 'ASIN',
        exponent: false
    },
    ACOS: {
        label: exponentRight('cos', symbols.minusOne),
        value: 'acos',
        type: types.function,
        token: 'ACOS',
        exponent: false
    },
    ATAN: {
        label: exponentRight('tan', symbols.minusOne),
        value: 'atan',
        type: types.function,
        token: 'ATAN',
        exponent: false
    },
    SINH: {
        label: 'sinh',
        value: 'sinh',
        type: types.function,
        token: 'SINH',
        exponent: false
    },
    COSH: {
        label: 'cosh',
        value: 'cosh',
        type: types.function,
        token: 'COSH',
        exponent: false
    },
    TANH: {
        label: 'tanh',
        value: 'tanh',
        type: types.function,
        token: 'TANH',
        exponent: false
    },
    ASINH: {
        label: exponentRight('sinh', symbols.minusOne),
        value: 'asinh',
        type: types.function,
        token: 'ASINH',
        exponent: false
    },
    ACOSH: {
        label: exponentRight('cosh', symbols.minusOne),
        value: 'acosh',
        type: types.function,
        token: 'ACOSH',
        exponent: false
    },
    ATANH: {
        label: exponentRight('tanh', symbols.minusOne),
        value: 'atanh',
        type: types.function,
        token: 'ATANH',
        exponent: false
    },
    LN: {
        label: 'ln',
        value: 'ln',
        type: types.function,
        token: 'LN',
        exponent: false
    },
    LOG: {
        label: 'ln',
        value: 'log',
        type: types.function,
        token: 'LOG',
        exponent: false
    },
    LG: {
        label: subscriptRight('log', '10'),
        value: 'lg',
        type: types.function,
        token: 'LG',
        exponent: false
    },
    LOG10: {
        label: subscriptRight('log', '10'),
        value: 'log10',
        type: types.function,
        token: 'LOG10',
        exponent: false
    },
    ABS: {
        label: 'abs',
        value: 'abs',
        type: types.function,
        token: 'ABS',
        exponent: false
    },
    RAND: {
        label: 'random',
        value: 'random',
        type: types.function,
        token: 'RAND',
        exponent: false
    }
};
