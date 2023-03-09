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

import tokensHelper from '../tokens.js';

const cannotStart = ['MUL', 'DIV', 'MOD', 'POW', 'FAC', 'ASSIGN', 'PERCENT', 'NTHRT', 'RPAR', 'COMMA'];

/**
 * List of known strategies to apply to the current tokens when adding a new term.
 * This will help to decide if the new term can be accepter or not.
 * Each strategy expect a list of tokens in this order: ..., current, next.
 * The result will be `true` if the new token must be rejected.
 * Otherwise, it will be `null` if no strategy applies.
 * @type {contextStrategy[]}
 */
export const limitStrategies = [
    /**
     * Check if the expression is empty and the new term cannot start an expression.
     * @param {token[]} tokens - The list of tokens on which apply the strategy.
     * @returns {boolean|null} - Returns `true` if the new token is rejected.
     * Otherwise, returns `null` if the strategy does not apply.
     */
    function limitExpressionStart(tokens = []) {
        if (!tokens.length || tokens.length > 1) {
            return null;
        }

        const [newToken] = tokens;
        const newTerm = tokensHelper.getTerm(newToken);

        if (newTerm && cannotStart.includes(newTerm.token)) {
            return true;
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
        const [newToken] = tokens.slice(-1);
        const newTerm = tokensHelper.getTerm(newToken);
        const currentTerm = tokensHelper.getTerm(currentTokens[0]);

        const isClosing = newTerm && newTerm.token === 'RPAR';
        const isPostfixing = newTerm && tokensHelper.isUnaryOperator(newTerm);
        const isOpen = currentTerm && (currentTerm.token === 'LPAR' || tokensHelper.isFunction(currentTerm));
        const isOperator = currentTerm && tokensHelper.isBinaryOperator(currentTerm);

        if ((isClosing && (isOpen || isOperator)) || (isPostfixing && isOpen)) {
            return true;
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
