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

import { counterFactory } from '../../utils';
import { isFunctionOperator } from '../terms';
import tokensHelper from '../tokens.js';

/**
 * List of known strategies to apply to the current tokens when adding a new term.
 * This will help to decide if existing tokens need to be evaluated prior to add the term.
 * Each strategy expect a list of tokens in this order: ..., current, next.
 * The result will be `true` if the current tokens must be evaluated.
 * Otherwise, it will be `null` if no strategy applies.
 * @type {contextStrategy[]}
 */
export const triggerStrategies = [
    /**
     * Check if the expression must be evaluated before adding the new term.
     * @param {token[]} tokens - The list of tokens on which apply the strategy.
     * @returns {boolean|null} - Returns `true` if the current tokens must be evaluated.
     * Otherwise, returns `null` if the strategy does not apply.
     */
    function triggerEval(tokens = []) {
        if (tokens.length < 4) {
            return null;
        }

        const currentTokens = tokens.slice(0, -1);
        const [newToken] = tokens.slice(-1);
        const newTerm = tokensHelper.getTerm(newToken);

        if (
            !newTerm ||
            newTerm.token === 'ASSIGN' ||
            (!isFunctionOperator(newTerm.token) && !tokensHelper.isBinaryOperator(newTerm))
        ) {
            return null;
        }

        const operands = counterFactory();
        const operators = counterFactory();
        let parenthesis = 0;
        currentTokens.forEach(token => {
            const term = tokensHelper.getTerm(token);
            const functionOperator = isFunctionOperator(term.token);

            operands.check(tokensHelper.isOperand(term) && !functionOperator);
            operators.check(tokensHelper.isBinaryOperator(term) || functionOperator);

            switch (term.token) {
                case 'RPAR':
                    parenthesis--;
                    break;

                case 'LPAR':
                    parenthesis++;
                    break;
            }
        });
        operands.check();
        operators.check();

        if (!parenthesis && operands.count > 1 && operators.count && operands.count > operators.count) {
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