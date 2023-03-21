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

import { terms } from '../terms.js';
import tokensHelper from '../tokens.js';
import { applyChangeStrategies } from './helpers.js';

/**
 * List of tokens that refuse explicit positive sign
 * @type {string[]}
 */
const refuseExplicitPositive = ['LPAR', 'SUB', 'ADD', 'MUL', 'DIV', 'MOD', 'POW', 'ASSIGN'];

/**
 * Checks if a token accept an explicit positive sign on the right
 * @param {token} token
 * @returns {boolean}
 */
const acceptExplicitPositive = token =>
    !token || (!tokensHelper.isFunction(token) && refuseExplicitPositive.indexOf(token.type) === -1);

/**
 * Produces a descriptor to insert a negative sign
 * @param {token} token
 * @returns {tokenChange}
 */
function insertNegativeSign(token) {
    const { offset } = token;
    const { value } = terms.SUB;
    return {
        offset,
        length: 0,
        value,
        move: value.length
    };
}

/**
 * Produces a descriptor to replace a sign by a negative sign
 * @param {token} token
 * @returns {tokenChange}
 */
function replaceByNegativeSign(token) {
    const { offset } = token;
    const { value } = terms.SUB;
    return {
        offset,
        length: token.value.length,
        value,
        move: value.length - token.value.length
    };
}

/**
 * Produces a descriptor to replace a sign by a positive sign
 * @param {token} token
 * @param {number} index
 * @param {token[]} tokens
 * @returns {tokenChange}
 */
function replaceByPositiveSign(token, index, tokens) {
    const allowExplicit = index && acceptExplicitPositive(tokens[index - 1]);
    const { offset } = token;
    const value = (allowExplicit && terms.ADD.value) || '';
    return {
        offset,
        length: token.value.length,
        value,
        move: value.length - token.value.length
    };
}

/**
 * Apply a sign change at the current index
 * @param {number} index - The index of the current token
 * @param {token[]} tokens - The list of tokens that represent the expression
 * @returns {tokenChange|null} - The result of the strategy: `null` if cannot apply, or the descriptor of the change
 */
function applySignChange(index, tokens) {
    const token = tokens[index];
    const nextToken = tokens[index + 1];
    const type = tokensHelper.getType(token);
    let result = null;

    if (token) {
        if (tokensHelper.isOperator(type)) {
            // an operator precedes the operand
            if (token.type === 'SUB' || token.type === 'NEG') {
                // the operator is -, simply replace it by +
                result = replaceByPositiveSign(token, index, tokens);
            } else if (token.type === 'ADD' || token.type === 'POS') {
                // the operator is +, simply replace it by -
                result = replaceByNegativeSign(token);
            } else if (nextToken) {
                // the operator is not + or -, simply negate the value
                result = insertNegativeSign(nextToken);
            }
        } else if (nextToken && (tokensHelper.isFunction(type) || token.type === 'LPAR')) {
            // a function or a left parenthesis precedes the operand, simply negate the operand
            result = insertNegativeSign(nextToken);
        }
    }

    return result;
}

/**
 * List of known strategies to apply on an expression in order to process sign change.
 * Each strategy will return either `null` if cannot apply, or the descriptor of the change to apply.
 * @type {tokenStrategy[]}
 */
export const signStrategies = [
    /**
     * Strategy that applies on numeric operands only
     * @param {number} index - The index of the current token
     * @param {token[]} tokens - The list of tokens that represent the expression
     * @returns {tokenChange|null} - The result of the strategy: `null` if cannot apply, or the descriptor of the change
     */
    function strategyNumeric(index, tokens) {
        let token = tokens[index];
        let type = tokensHelper.getType(token);
        let result = null;

        if (tokensHelper.isDigit(type) && index >= 0) {
            // find the first token on the left of the operand
            while (index && tokensHelper.isDigit(type)) {
                index--;
                token = tokens[index];
                type = tokensHelper.getType(token);
            }

            if (tokensHelper.isDigit(type) && index === 0) {
                // the operand is the first of the expression, so the sign is implicit +, simply negate the value
                result = insertNegativeSign(token);
            } else {
                // the operand is preceded by something else
                result = applySignChange(index, tokens);
            }
        }

        return result;
    },

    /**
     * Strategy that applies on operators only
     * @param {number} index - The index of the current token
     * @param {token[]} tokens - The list of tokens that represent the expression
     * @returns {tokenChange|null} - The result of the strategy: `null` if cannot apply, or the descriptor of the change
     */
    function strategyOperator(index, tokens) {
        let token = tokens[index];
        let type = tokensHelper.getType(token);
        let result = null;

        if (tokensHelper.isOperator(type) && index >= 0) {
            if (token.type === 'SUB' || token.type === 'NEG') {
                // the operator is -, simply replace it by +
                result = replaceByPositiveSign(token, index, tokens);
            } else if (token.type === 'ADD' || token.type === 'POS') {
                // the operator is +, simply replace it by -
                result = replaceByNegativeSign(token);
            } else if (tokensHelper.isUnaryOperator(token.type) && index > 0) {
                // the operator is unary, need to identify the operand
                result = applyChangeStrategies(index - 1, tokens, signStrategies);
            }
        }

        return result;
    },

    /**
     * Strategy that applies on identifiers only (constants, variables, functions)
     * @param {number} index - The index of the current token
     * @param {token[]} tokens - The list of tokens that represent the expression
     * @returns {tokenChange|null} - The result of the strategy: `null` if cannot apply, or the descriptor of the change
     */
    function strategyIdentifier(index, tokens) {
        let token = tokens[index];
        let type = tokensHelper.getType(token);
        let result = null;

        if (tokensHelper.isIdentifier(type) && index >= 0) {
            if (index === 0) {
                // the token is the first of the expression, so the sign is implicit +, simply negate the value
                result = insertNegativeSign(token);
            } else {
                // the token is preceded by something else
                result = applySignChange(index - 1, tokens);
            }
        }

        return result;
    },

    /**
     * Strategy that applies on sub-expression only
     * @param {number} index - The index of the current token
     * @param {token[]} tokens - The list of tokens that represent the expression
     * @returns {tokenChange|null} - The result of the strategy: `null` if cannot apply, or the descriptor of the change
     */
    function strategyExpression(index, tokens) {
        let token = tokens[index];
        let type = tokensHelper.getType(token);
        let result = null;
        let count = 0;

        if (tokensHelper.isAggregator(type) && index >= 0) {
            if (token.type === 'RPAR') {
                count++;
            }

            // find the opening parenthesis
            while (index && (token.type !== 'LPAR' || count)) {
                index--;
                token = tokens[index];

                if (token.type === 'RPAR') {
                    count++;
                }
                if (token.type === 'LPAR') {
                    count--;
                }
            }

            if (!count && token.type === 'LPAR') {
                if (index === 0) {
                    // the token is the first of the expression, so the sign is implicit +, simply negate the value
                    result = insertNegativeSign(token);
                } else {
                    // the token is preceded by something else
                    result = applySignChange(index - 1, tokens);
                }
            }
        }

        return result;
    }
];

/**
 * @typedef {import('../tokenizer.js').token} token
 */

/**
 * @typedef {import('./helpers.js').tokenStrategy} tokenStrategy
 */

/**
 * @typedef {import('./helpers.js').tokenChange} tokenChange
 */
