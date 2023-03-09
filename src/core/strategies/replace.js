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

import { signOperators } from '../terms.js';
import tokensHelper from '../tokens.js';

/**
 * List of known strategies to apply to the current tokens when adding a new term.
 * This will help to decide if we need to replace the current token.
 * Each strategy expect a list of tokens in this order: ..., current, next.
 * The result will be `true` if the current token must be replaced.
 * Otherwise, it will be `null` if no strategy applies.
 * @type {contextStrategy[]}
 */
export const replaceStrategies = [
    /**
     * Triggers the token replacement if the current token and the new token are operators.
     * @param {token[]} tokens - The list of tokens on which apply the strategy.
     * @returns {number|null} - Returns `true` if the current token must be replaced.
     * Otherwise, returns `null` if the strategy does not apply.
     */
    function (tokens = []) {
        const currentTokens = tokens.slice(0, -1).reverse();
        const [newToken] = tokens.slice(-1);
        const newTerm = tokensHelper.getTerm(newToken);
        let currentTerm = tokensHelper.getTerm(currentTokens[0]);
        const addOperator = newTerm && tokensHelper.isOperator(newTerm);
        const isOperator = () => currentTerm && tokensHelper.isBinaryOperator(currentTerm);

        if (addOperator && isOperator()) {
            if ((newTerm.token === 'SUB' || newTerm.token === 'NEG') && signOperators.indexOf(currentTerm.token) < 0) {
                return 0;
            }

            let replace = 1;
            let len = currentTokens.length;
            let checkNext = true;
            for (let i = 1; checkNext && i < len; i++) {
                currentTerm = tokensHelper.getTerm(currentTokens[i]);
                checkNext = isOperator();

                if (checkNext) {
                    replace++;
                }
            }
            return replace;
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
