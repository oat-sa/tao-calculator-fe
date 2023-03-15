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
 * Checks if the list of tokens ends with an operator.
 * @param {token[]} tokens - The list of tokens to check.
 * @returns {boolean} - Returns true if the last token is an operator.
 */
function endWithOperator(tokens) {
    const [token] = tokens.slice(-1);
    const term = tokensHelper.getTerm(token);
    return tokensHelper.isOperator(token) || tokensHelper.isFunction(token) || term.token === 'LPAR';
}

/**
 * List of known strategies to apply for correcting an expression before evaluating it.
 * It will produce a descriptor for correcting the expression if needed.
 * @type {listStrategy[]}
 */
export const correctStrategies = [
    /**
     * Removes dummy operators from the expression.
     * @param {token[]} tokens - The list of tokens on which apply the strategy.
     * @returns {token[]} - Returns the corrected list of tokens.
     */
    function removeDummyOperators(tokens = []) {
        while (tokens.length && endWithOperator(tokens)) {
            tokens.pop();
        }
        return tokens;
    },

    /**
     * Adds missing parenthesis to the expression.
     * @param {token[]} tokens - The list of tokens on which apply the strategy.
     * @returns {token[]} - Returns the corrected list of tokens.
     */
    function correctParenthesis(tokens = []) {
        let parenthesis = 0;
        tokens.forEach(token => {
            const term = tokensHelper.getTerm(token);

            switch (term.token) {
                case 'RPAR':
                    parenthesis--;
                    break;

                case 'LPAR':
                    parenthesis++;
                    break;
            }
        });

        while (parenthesis > 0) {
            const [last] = tokens.slice(-1);
            tokens.push({
                type: 'RPAR',
                value: ')',
                text: ')',
                offset: last.offset + last.value.length
            });
            parenthesis--;
        }

        return tokens;
    }
];

/**
 * @typedef {import('../tokenizer.js').token} token
 */

/**
 * @typedef {import('./helpers.js').listStrategy} listStrategy
 */
