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
 * Copyright (c) 2018-2023 Open Assessment Technologies SA ;
 */

import { terms } from '../terms.js';
import tokensHelper from '../tokens.js';

/**
 * Adds a multiply operator before the value.
 * @param {string} value - The value to modify.
 * @returns {string} - The modified value.
 */
const multiplyBefore = value => `*${value}`;

/**
 * Adds a space before the value.
 * @param {string} value - The value to modify.
 * @returns {string} - The modified value.
 */
const spaceBefore = value => ` ${value}`;

/**
 * List of strategies to apply for glueing tokens together with a prefix.
 * @type {valueStrategy[]}
 */
export const prefixStrategies = [
    {
        // adding an opening parenthesis after a value, a unary operator, or a closing parenthesis
        predicate(previous, next) {
            const previousTerm = terms[previous];
            return (
                next === 'LPAR' &&
                (previous === 'RPAR' ||
                    tokensHelper.isValue(previousTerm) ||
                    tokensHelper.isUnaryOperator(previousTerm))
            );
        },
        action: multiplyBefore
    },
    {
        // adding an identifier or a value after a closing parenthesis
        predicate(previous, next) {
            const nextTerm = terms[next];
            return (
                previous === 'RPAR' &&
                nextTerm.exponent !== 'left' &&
                (tokensHelper.isValue(nextTerm) || tokensHelper.isFunction(nextTerm))
            );
        },
        action: multiplyBefore
    },
    {
        // adding an identifier after a value or a unary operator
        predicate(previous, next) {
            const previousTerm = terms[previous];
            const nextTerm = terms[next];
            return (
                (tokensHelper.isValue(previousTerm) || tokensHelper.isUnaryOperator(previousTerm)) &&
                tokensHelper.isIdentifier(nextTerm) &&
                nextTerm.exponent !== 'left'
            );
        },
        action: multiplyBefore
    },
    {
        // adding a digit after an identifier that is not a function
        predicate(previous, next) {
            const previousTerm = terms[previous];
            const nextTerm = terms[next];
            return (
                tokensHelper.isIdentifier(previousTerm) &&
                !tokensHelper.isFunction(previousTerm) &&
                tokensHelper.isDigit(nextTerm)
            );
        },
        action: multiplyBefore
    },
    {
        // adding a value after a unary operator
        predicate(previous, next) {
            const previousTerm = terms[previous];
            const nextTerm = terms[next];
            return tokensHelper.isUnaryOperator(previousTerm) && tokensHelper.isValue(nextTerm);
        },
        action: multiplyBefore
    },
    {
        // adding an identifier or a value after a function
        predicate(previous, next) {
            const previousTerm = terms[previous];
            const nextTerm = terms[next];
            return (
                tokensHelper.isFunction(previousTerm) &&
                (tokensHelper.isIdentifier(nextTerm) || !tokensHelper.isSeparator(nextTerm))
            );
        },
        action: spaceBefore
    }
];

/**
 * @typedef {import('./helpers.js').valueStrategy} valueStrategy
 */
