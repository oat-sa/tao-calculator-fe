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

import { isSignOperator } from '../terms.js';
import tokensHelper from '../tokens.js';

/**
 * The list of tokens that cannot start an expression.
 * @type {string[]}
 */
const cannotStartWith = ['MUL', 'DIV', 'MOD', 'POW', 'FAC', 'ASSIGN', 'PERCENT', 'NTHRT', 'RPAR', 'COMMA'];

/**
 * Checks if a term cannot start an expression.
 * @param {token} token - The term to check.
 * @returns {boolean} - Returns `true` if the term cannot start an expression.
 */
const cannotStart = token => {
    const term = token && tokensHelper.getTerm(token);
    return term && cannotStartWith.includes(term.token);
};

/**
 * Checks if a term is a sign operator.
 * @param {token} token - The term to check.
 * @returns {boolean} - Returns `true` if the term is a sign.
 */
const isSign = token => {
    const term = token && tokensHelper.getTerm(token);
    return term && isSignOperator(term.token);
};

/**
 * List of known strategies to apply to the current tokens when adding a new term.
 * This will help to decide if the new term can be accepted or not.
 * Each strategy expect a list of tokens in this order: ..., current, next.
 * The result will be `true` if the new token must be rejected.
 * Otherwise, it will be `null` if no strategy applies.
 * @type {contextStrategy[]}
 */
export const limitStrategies = [
    /**
     * Check if the expression is starting and the new term cannot start an expression.
     * @param {token[]} tokens - The list of tokens on which apply the strategy.
     * @returns {boolean|null} - Returns `true` if the new token is rejected.
     * Otherwise, returns `null` if the strategy does not apply.
     */
    function limitExpressionStart(tokens = []) {
        // ex: '*', '/', '^'
        if (tokens.length === 1 && cannotStart(tokens[0])) {
            return true;
        }

        // ex: '-*', '+^', 'tan/'
        if (
            tokens.length === 2 &&
            (isSign(tokens[0]) || tokensHelper.isFunction(tokens[0])) &&
            cannotStart(tokens[1])
        ) {
            return true;
        }

        // ex: '4*(*',  '4*(-/', 'cos-*'
        if (tokens.length >= 2) {
            const [previousToken] = tokens.slice(-3, -2);
            const [currentToken] = tokens.slice(-2, -1);
            const [newToken] = tokens.slice(-1);
            if (
                cannotStart(newToken) &&
                (tokensHelper.getToken(currentToken) === 'LPAR' ||
                    tokensHelper.isFunction(currentToken) ||
                    (tokensHelper.getToken(previousToken) === 'LPAR' && isSign(currentToken)) ||
                    (tokensHelper.isFunction(previousToken) && tokensHelper.isOperator(currentToken)))
            ) {
                return true;
            }
        }

        return null;
    },

    /**
     * Check if a decimal separator can be added.
     * @param {token[]} tokens - The list of tokens on which apply the strategy.
     * @returns {boolean|null} - Returns `true` if the new token is rejected.
     * Otherwise, returns `null` if the strategy does not apply.
     */
    function limitDecimalSeparator(tokens = []) {
        if (tokens.length <= 1) {
            return null;
        }

        const [newToken] = tokens.slice(-1);
        if (tokensHelper.getToken(newToken) !== 'DOT') {
            return null;
        }

        for (let i = tokens.length - 2; i > -1 && tokensHelper.isDigit(tokens[i]); i--) {
            if (tokensHelper.getToken(tokens[i]) === 'DOT') {
                return true;
            }
        }

        return null;
    },

    /**
     * Check if the expression can be closed.
     * @param {token[]} tokens - The list of tokens on which apply the strategy.
     * @returns {boolean|null} - Returns `true` if the new token is rejected.
     * Otherwise, returns `null` if the strategy does not apply.
     */
    function limitExpressionClose(tokens = []) {
        if (tokens.length < 2) {
            return null;
        }

        const currentTokens = tokens.slice(0, -1).reverse();
        const currentToken = currentTokens[0];
        const [newToken] = tokens.slice(-1);

        const isClosing = tokensHelper.getToken(newToken) === 'RPAR';
        const isPostfixing = tokensHelper.isUnaryOperator(newToken);
        const isOpen = tokensHelper.getToken(currentToken) === 'LPAR' || tokensHelper.isFunction(currentToken);
        const isOperator = tokensHelper.isBinaryOperator(currentToken);

        // can the current expression be closed?
        if ((isClosing && (isOpen || isOperator)) || (isPostfixing && isOpen)) {
            return true;
        }

        // check if the number of open parenthesis allows to add closing parenthesis
        if (isClosing) {
            let count = 0;
            tokens.forEach(token => {
                switch (tokensHelper.getToken(token)) {
                    case 'RPAR':
                        count--;
                        break;

                    case 'LPAR':
                        count++;
                        break;
                }
            });

            if (count < 0) {
                return true;
            }
        }

        return null;
    }
];

/**
 * @typedef {import('../tokenizer.js').token} token
 */

/**
 * @typedef {import('./helpers.js').contextStrategy} contextStrategy
 */
