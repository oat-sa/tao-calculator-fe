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
 * Adds a multiply operator after the value.
 * @param {string} value - The value to modify.
 * @returns {string} - The modified value.
 */
const multiplyAfter = value => `${value}${terms.MUL.value}`;

/**
 * Adds a space after the value.
 * @param {string} value - The value to modify.
 * @returns {string} - The modified value.
 */
const spaceAfter = value => `${value} `;

/**
 * List of strategies to apply for glueing tokens together with a suffix.
 * @type {valueStrategy[]}
 */
export const suffixStrategies = [
    {
        // adding a closing parenthesis or a unary operator before a value, a function, or an opening parenthesis
        predicate(previous, next) {
            const previousTerm = terms[previous];
            const nextTerm = terms[next];
            return (
                (previous === 'RPAR' || tokensHelper.isUnaryOperator(previousTerm)) &&
                (next === 'LPAR' || tokensHelper.isValue(nextTerm) || tokensHelper.isFunction(nextTerm))
            );
        },
        action: multiplyAfter
    },
    {
        // adding an identifier, a unary operator, or a value before an opening parenthesis
        predicate(previous, next) {
            const previousTerm = terms[previous];
            return (
                next === 'LPAR' &&
                (tokensHelper.isValue(previousTerm) ||
                    tokensHelper.isUnaryOperator(previousTerm) ||
                    (tokensHelper.isIdentifier(previousTerm) && !tokensHelper.isFunction(previousTerm)))
            );
        },
        action: multiplyAfter
    },
    {
        // adding an identifier that is not a function before a value
        predicate(previous, next) {
            const previousTerm = terms[previous];
            const nextTerm = terms[next];
            return (
                tokensHelper.isIdentifier(previousTerm) &&
                !tokensHelper.isFunction(previousTerm) &&
                !tokensHelper.isSeparator(nextTerm)
            );
        },
        action: multiplyAfter
    },
    {
        // adding a digit or a unary operator before an identifier
        predicate(previous, next) {
            const previousTerm = terms[previous];
            const nextTerm = terms[next];
            return (
                (tokensHelper.isDigit(previousTerm) || tokensHelper.isUnaryOperator(previousTerm)) &&
                tokensHelper.isIdentifier(nextTerm)
            );
        },
        action: multiplyAfter
    },
    {
        // adding a function before a value
        predicate(previous, next) {
            const previousTerm = terms[previous];
            const nextTerm = terms[next];
            return tokensHelper.isFunction(previousTerm) && !tokensHelper.isSeparator(nextTerm);
        },
        action: spaceAfter
    }
];

/**
 * @typedef {import('./helpers.js').valueStrategy} valueStrategy
 */
