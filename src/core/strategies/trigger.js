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

import { counterFactory } from '../../utils/index.js';
import { isFunctionOperator } from '../terms.js';
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
     * Checks if the expression contains enough terms to let the next strategy applies.
     * @param {token[]} tokens - The list of tokens on which apply the strategy.
     * @returns {boolean|null} - Returns `false` if the expression does not contain enough tokens.
     * Otherwise, returns `null` if the next strategy could apply.
     */
    function expressionFilled(tokens = []) {
        if (tokens.length < 4) {
            return false;
        }

        return null;
    },

    /**
     * Checks if the new term needs the expression to be evaluated before.
     * @param {token[]} tokens - The list of tokens on which apply the strategy.
     * @returns {boolean|null} - Returns `false` if the new term to does not require the expression to be evaluated.
     * Otherwise, returns `null` if the next strategy could apply.
     */
    function addingOperator(tokens = []) {
        const [newToken] = tokens.slice(-1);
        const newTerm = tokensHelper.getTerm(newToken);

        if (
            !newTerm ||
            newTerm.token === 'ASSIGN' ||
            (!isFunctionOperator(newTerm.token) && !tokensHelper.isBinaryOperator(newTerm))
        ) {
            return false;
        }

        return null;
    },

    /**
     * Checks if the current term is a function.
     * In this case, the next term must be an operand, and it cannot trigger the evaluation.
     * @param {token[]} tokens - The list of tokens on which apply the strategy.
     * @returns {boolean|null} - Returns `false` if the current term is a function.
     * Otherwise, returns `null` if the next strategy could apply.
     */
    function orphanFunction(tokens = []) {
        const [currentToken] = tokens.slice(-2, -1);

        if (tokensHelper.isFunction(currentToken)) {
            return false;
        }

        return null;
    },

    /**
     * Checks if the expression can be evaluated before adding the new term.
     * @param {token[]} tokens - The list of tokens on which apply the strategy.
     * @returns {boolean|null} - Returns `true` if the current expression can be evaluated.
     * Otherwise, returns `false`.
     */
    function expressionComplete(tokens = []) {
        const currentTokens = tokens.slice(0, -1);
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

        return false;
    }
];

/**
 * @typedef {import('../tokenizer.js').token} token
 */

/**
 * @typedef {import('./helpers.js').contextStrategy} contextStrategy
 */
