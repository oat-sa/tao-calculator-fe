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

import { terms, types } from './terms.js';

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
        if ('string' === typeof token) {
            return token;
        }

        const type = (token && token.type) || null;
        const term = terms[type];
        return (term && term.type) || type;
    },

    /**
     * Checks if the type is related to a digit value
     * @param {string|object} type
     * @returns {boolean}
     */
    isDigit(type) {
        return tokensHelper.getType(type) === types.digit;
    },

    /**
     * Checks if the type is related to an operator
     * @param {string|object} type
     * @returns {boolean}
     */
    isOperator(type) {
        return tokensHelper.getType(type) === types.operator;
    },

    /**
     * Checks if the type is related to an operand
     * @param {string|object} type
     * @returns {boolean}
     */
    isOperand(type) {
        type = tokensHelper.getType(type);
        return type !== types.operator && type !== types.aggregator && type !== types.separator;
    },

    /**
     * Checks if the type is related to an operand
     * @param {string|object} type
     * @returns {boolean}
     */
    isValue(type) {
        type = tokensHelper.getType(type);
        return (
            type === types.digit ||
            type === types.constant ||
            type === types.variable ||
            type === types.term ||
            type === types.error
        );
    },

    /**
     * Checks if the type is related to an aggregator
     * @param {string|object} type
     * @returns {boolean}
     */
    isAggregator(type) {
        return tokensHelper.getType(type) === types.aggregator;
    },

    /**
     * Checks if the type is related to an error
     * @param {string|object} type
     * @returns {boolean}
     */
    isError(type) {
        return tokensHelper.getType(type) === types.error;
    },

    /**
     * Checks if the type is related to a constant
     * @param {string|object} type
     * @returns {boolean}
     */
    isConstant(type) {
        return tokensHelper.getType(type) === types.constant;
    },

    /**
     * Checks if the type is related to a variable
     * @param {string|object} type
     * @returns {boolean}
     */
    isVariable(type) {
        type = tokensHelper.getType(type);
        return type === types.variable || type === types.term;
    },

    /**
     * Checks if the type is related to a function
     * @param {string|object} type
     * @returns {boolean}
     */
    isFunction(type) {
        return tokensHelper.getType(type) === types.function;
    },

    /**
     * Checks if the type is related to an identifier
     * @param {string|object} type
     * @returns {boolean}
     */
    isIdentifier(type) {
        type = tokensHelper.getType(type);
        return (
            type === types.constant ||
            type === types.variable ||
            type === types.term ||
            type === types.function ||
            type === types.error
        );
    },

    /**
     * Checks if the type is related to a separator
     * @param {string|object} type
     * @returns {boolean}
     */
    isSeparator(type) {
        type = tokensHelper.getType(type);
        return type === types.operator || type === types.aggregator || type === types.separator;
    },

    /**
     * Checks if the type is related to a modifier
     * @param {string|object} type
     * @returns {boolean}
     */
    isModifier(type) {
        type = tokensHelper.getType(type);
        return type === types.operator || type === types.function;
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
