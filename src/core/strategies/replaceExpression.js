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

import { isFunctionOperator } from '../terms.js';
import tokensHelper from '../tokens.js';

/**
 * List of known strategies to apply to the current tokens when adding a new term.
 * This will help to decide if we need to replace the current expression by the new term.
 * Each strategy expect a list of tokens in this order: ..., current, next.
 * The result will be `true` if the current expression must be replaced.
 * Otherwise, it will be `null` if no strategy applies.
 * @type {contextStrategy[]}
 */
export const replaceExpressionStrategies = [
    /**
     * The expression will be replaced by the new term if:
     * - it is a 0, and the term to add is not an operator nor a dot
     * - it is the last result, and the term to add is not an operator
     * @param {token[]} tokens - The list of tokens on which apply the strategy.
     * @returns {boolean} - Returns `true` if the current expression must be replaced.
     * Otherwise, returns `false`.
     */
    function replaceExpression(tokens = []) {
        const [currentTerm] = tokens.slice(-2, -1);
        const [newTerm] = tokens.slice(-1);
        const currentToken = tokensHelper.getToken(currentTerm);
        const newToken = tokensHelper.getToken(newTerm);

        if (
            tokens.length === 2 &&
            !tokensHelper.isOperator(newTerm) &&
            !isFunctionOperator(newToken) &&
            ((currentToken === 'NUM0' && newToken !== 'DOT') || currentToken === 'VAR_ANS')
        ) {
            return true;
        }

        return false;
    }
];

/**
 * @typedef {import('../tokenizer.js').token} token
 */

/**
 * @typedef {import('./helpers.js').contextStrategy} contextStrategy
 */
