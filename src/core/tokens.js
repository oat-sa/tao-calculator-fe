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
 * Copyright (c) 2019-2023 Open Assessment Technologies SA ;
 */

import registeredTerms from './terms.js';

/**
 * List of helpers that apply on tokens
 * @type {object}
 */
const tokensHelper = {
    /**
     * Identifies the type of a given token
     * @param {string|object} token
     * @returns {string}
     */
    getType(token) {
        if ('string' !== typeof token) {
            const type = (token && token.type) || null;
            const term = registeredTerms[type];
            return (term && term.type) || type;
        }
        return token;
    },

    /**
     * Checks if the type is related to a digit value
     * @param {string|object} type
     * @returns {boolean}
     */
    isDigit(type) {
        return tokensHelper.getType(type) === 'digit';
    },

    /**
     * Checks if the type is related to an operator
     * @param {string|object} type
     * @returns {boolean}
     */
    isOperator(type) {
        return tokensHelper.getType(type) === 'operator';
    },

    /**
     * Checks if the type is related to an operand
     * @param {string|object} type
     * @returns {boolean}
     */
    isOperand(type) {
        type = tokensHelper.getType(type);
        return type !== 'operator' && type !== 'aggregator' && type !== 'separator';
    },

    /**
     * Checks if the type is related to an operand
     * @param {string|object} type
     * @returns {boolean}
     */
    isValue(type) {
        type = tokensHelper.getType(type);
        return type === 'digit' || type === 'constant' || type === 'variable' || type === 'term' || type === 'error';
    },

    /**
     * Checks if the type is related to an aggregator
     * @param {string|object} type
     * @returns {boolean}
     */
    isAggregator(type) {
        return tokensHelper.getType(type) === 'aggregator';
    },

    /**
     * Checks if the type is related to an error
     * @param {string|object} type
     * @returns {boolean}
     */
    isError(type) {
        return tokensHelper.getType(type) === 'error';
    },

    /**
     * Checks if the type is related to a constant
     * @param {string|object} type
     * @returns {boolean}
     */
    isConstant(type) {
        return tokensHelper.getType(type) === 'constant';
    },

    /**
     * Checks if the type is related to a variable
     * @param {string|object} type
     * @returns {boolean}
     */
    isVariable(type) {
        type = tokensHelper.getType(type);
        return type === 'variable' || type === 'term';
    },

    /**
     * Checks if the type is related to a function
     * @param {string|object} type
     * @returns {boolean}
     */
    isFunction(type) {
        return tokensHelper.getType(type) === 'function';
    },

    /**
     * Checks if the type is related to an identifier
     * @param {string|object} type
     * @returns {boolean}
     */
    isIdentifier(type) {
        type = tokensHelper.getType(type);
        return type === 'constant' || type === 'variable' || type === 'term' || type === 'function' || type === 'error';
    },

    /**
     * Checks if the type is related to a separator
     * @param {string|object} type
     * @returns {boolean}
     */
    isSeparator(type) {
        type = tokensHelper.getType(type);
        return type === 'operator' || type === 'aggregator' || type === 'separator';
    },

    /**
     * Checks if the type is related to a modifier
     * @param {string|object} type
     * @returns {boolean}
     */
    isModifier(type) {
        type = tokensHelper.getType(type);
        return type === 'operator' || type === 'function';
    },

    /**
     * Ensures an expression is a string. If a token or a descriptor is provided, extract the value.
     * @param {string|number|object} expression
     * @returns {string}
     */
    stringValue(expression) {
        const type = typeof expression;
        if (type !== 'string') {
            if (expression && 'undefined' !== typeof expression.value) {
                expression = expression.value;
            } else if (expression && 'undefined' !== typeof expression.result) {
                expression = expression.result;
            } else if (type === 'object' || type === 'undefined' || expression === null) {
                expression = '';
            }
            expression = String(expression);
        }
        return expression;
    }
};

export default tokensHelper;
