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

/**
 * List of known strategies to apply to the current token when adding a new term.
 * This will help to decide if we need to replace the current token.
 * Each strategy expect a list of 2 tokens in this order: current, next.
 * @type {contextStrategy[]}
 */
export const replaceStrategies = [
    /**
     * Triggers the token replacement if the current token and the new token are operators.
     * @param {token[]} tokens - The list of tokens on which apply the strategy.
     * @returns {boolean|null} - Returns `true` if the current token must be replaced.
     * Otherwise, returns `null` if the strategy does not apply.
     */
    function ([currentToken, newToken] = []) {
        const currentTerm = tokensHelper.getTerm(currentToken);
        const newTerm = tokensHelper.getTerm(newToken);
        const endWithOperator = currentTerm && tokensHelper.isOperator(currentTerm);
        const endWithUnary = endWithOperator && tokensHelper.isUnaryOperator(currentTerm);
        const addOperator = newTerm && tokensHelper.isOperator(newTerm);

        if (endWithOperator && addOperator && !endWithUnary) {
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
