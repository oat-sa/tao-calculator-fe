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

import { terms } from './terms.js';
import tokensHelper from './tokens.js';
import moo from 'moo';

/**
 * List of ignored tokens
 * @type {object}
 */
const ignoredTokens = {
    SPACE: {
        match: /\s+/,
        lineBreaks: true
    }
};

/**
 * Match keywords
 * @type {RegExp}
 */
const reKeyword = /[a-zA-Z_]\w*/;

/**
 * Match numbers
 * @type {RegExp}
 */
const reNumber = /[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/;

/**
 * Match keywords prefixed with @
 * @type {RegExp}
 */
const rePrefixedKeyword = /@[a-zA-Z_]\w*/;

/**
 * Match keywords only
 * @type {RegExp}
 */
const reKeywordOnly = /^[a-zA-Z_]\w*$/;

/**
 * Filter function that checks if the provided term is a keyword.
 * Keywords are all terms that have alphanumeric non digit value from the list of terms.
 * @param {object} term
 * @returns {boolean}
 */
const filterKeyword = term => term.value.match(reKeywordOnly);

/**
 * Filter function that checks if the provided term is a digit or a related symbol.
 * @param {object} term
 * @returns {boolean}
 */
const filterDigit = term => tokensHelper.isDigit(term) || term.value === '-' || term.value === '+';

/**
 * Extracts the token values from the list of terms.
 * @param {term[]} list - List of terms.
 * @returns {object} - List of token values.
 */
const extractTokenValues = list =>
    Object.entries(list).reduce((tokens, [token, { value }]) => {
        tokens[token] = value;
        return tokens;
    }, {});

/**
 * Extracts the tokens from the list of terms that match the provided filter.
 * @param {term[]} list - List of terms.
 * @param {function} predicate - Filter function.
 * @returns {term[]} - List of terms that match the filter.
 */
const extractTokensByType = (list, predicate) =>
    Object.entries(list).reduce((tokens, [token, term]) => {
        if (predicate(term)) {
            tokens[token] = term;
        }
        return tokens;
    }, {});

/**
 * List of keywords (functions from the list of registered terms).
 * @type {object}
 */
const keywords = extractTokensByType(terms, filterKeyword);

/**
 * List of symbols (operators and operands from the list of registered terms).
 * @type {object}
 */
const symbols = extractTokensByType(terms, term => !filterKeyword(term));

/**
 * List of digits and related symbols
 * @type {object}
 */
const digits = extractTokensByType(terms, filterDigit);

/**
 * @typedef {object} token
 * @property {string} type - The identifier of the token
 * @property {string} value - The actual value of the token
 * @property {string} text - The raw value that produced the token
 * @property {number} offset - The original offset in the source
 */

/**
 * Generates an expression tokenizer.
 * It will tokenize a mathematical expression based on the list of known terms.
 *
 * @example
 *
 * const expression = '(.1 + .2) * 10^8';
 * const tokenizer = calculatorTokenizerFactory();
 * const terms = tokenizer(expression);
 *
 * // terms now contains an array of terms:
 * // [{type: "LPAR", value: "(", text: "(", offset: 0},
 * //  {type: "DOT", value: ".", text: ".", offset: 1},
 * //  {type: "NUM1", value: "1", text: "1", offset: 2},
 * //  {type: "ADD", value: "+", text: "+", offset: 4},
 * //  {type: "DOT", value: ".", text: ".", offset: 6},
 * //  {type: "NUM2", value: "2", text: "2", offset: 7},
 * //  {type: "RPAR", value: ")", text: ")", offset: 8},
 * //  {type: "MUL", value: "*", text: "*", offset: 10},
 * //  {type: "NUM1", value: "1", text: "1", offset: 12},
 * //  {type: "NUM0", value: "0", text: "0", offset: 13},
 * //  {type: "POW", value: "^", text: "^", offset: 14},
 * //  {type: "NUM8", value: "8", text: "8", offset: 15}]
 *
 * @param {object} [config]
 * @param {object} [config.keywords] - List of additional keywords: key being the name, value being the pattern (should be on the domain /[a-zA-Z]+/)
 * @param {object} [config.symbols] - List of additional symbols: key being the name, value being the pattern
 * @param {object} [config.digits] - List of additional digits: key being the name, value being the pattern
 * @returns {calculatorTokenizer}
 */
function tokenizerFactory(config = {}) {
    const keywordsList = Object.assign({}, config.keywords, extractTokenValues(keywords));
    const symbolsList = Object.assign({}, config.symbols, extractTokenValues(symbols));
    const digitsList = Object.assign({}, config.digits, extractTokenValues(digits));
    const keywordsTransform = moo.keywords(keywordsList);
    const tokensList = Object.assign(
        {},
        ignoredTokens,
        {
            number: reNumber,
            prefixed: {
                match: rePrefixedKeyword,
                type(token) {
                    // simply rely on the keywords transform to identify the prefixed keyword
                    return keywordsTransform(token.substring(1));
                }
            },
            term: {
                match: reKeyword,
                type: keywordsTransform
            },
            syntaxError: moo.error
        },
        symbolsList
    );

    // console.log('tokenList', tokensList);
    // console.log('digitsList', digitsList);

    // Lexer used to tokenize the expression
    const lexer = moo.compile(tokensList);

    // Lexer used to tokenize numbers
    const digitLexer = moo.compile(digitsList);

    let digitContext;

    /**
     * Extracts a token from the current position in the expression
     * @returns {token}
     */
    function next() {
        let token;

        if (digitContext) {
            token = digitLexer.next();
            if (token) {
                token.offset += digitContext.offset;
            }
        }

        if (!token) {
            digitContext = null;

            do {
                token = lexer.next();
            } while (token && ignoredTokens[token.type]);

            // rely on a specific lexer to tokenize numbers
            // this is required to properly identify numbers like 42e15 without colliding with regular identifiers
            if (token && token.type === 'number') {
                digitContext = token;
                digitLexer.reset(token.value);
                token = next();
            }
        }

        return token;
    }

    /**
     * @typedef {object} calculatorTokenizer
     */
    const tokenizer = {
        /**
         * Gets an iterator that will returns tokens from the provided expression
         * @param {string} expression
         * @returns {function(): token}
         */
        iterator(expression) {
            lexer.reset(tokensHelper.stringValue(expression));
            return next;
        },

        /**
         * Tokenizes the expression
         * @param {string} expression
         * @returns {token[]}
         */
        tokenize(expression) {
            const iterator = tokenizer.iterator(expression);
            const tokens = [];

            let token;
            do {
                token = iterator();
                if (token) {
                    const { type, value, text, offset } = token;
                    tokens.push({ type, value, text, offset });
                }
            } while (token);

            return tokens;
        }
    };

    return tokenizer;
}

export default tokenizerFactory;

/**
 * @typedef {import('./terms.js').term} term
 */
