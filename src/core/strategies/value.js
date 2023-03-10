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
 * Adds a multiply operator after the value.
 * @param {string} value - The value to modify.
 * @returns {string} - The modified value.
 */
const multiplyAfter = value => `${value}*`;

/**
 * Adds a space before the value.
 * @param {string} value - The value to modify.
 * @returns {string} - The modified value.
 */
const spaceBefore = value => ` ${value}`;

/**
 * Adds a space after the value.
 * @param {string} value - The value to modify.
 * @returns {string} - The modified value.
 */
const spaceAfter = value => `${value} `;

/**
 * List of strategies to apply for glueing tokens together with a prefix.
 * @type {valueStrategy[]}
 */
export const prefixStrategies = [
    {
        // adding an opening parenthesis after a value or a closing parenthesis
        predicate(previous, next) {
            const previousTerm = terms[previous];
            return next === 'LPAR' && (previous === 'RPAR' || tokensHelper.isValue(previousTerm));
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
        // adding an identifier after a value
        predicate(previous, next) {
            const previousTerm = terms[previous];
            const nextTerm = terms[next];
            return (
                tokensHelper.isValue(previousTerm) &&
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
 * List of strategies to apply for glueing tokens together with a suffix.
 * @type {valueStrategy[]}
 */
export const suffixStrategies = [
    {
        // adding a closing parenthesis before a value, a function, or an opening parenthesis
        predicate(previous, next) {
            const nextTerm = terms[next];
            return (
                previous === 'RPAR' &&
                (next === 'LPAR' || tokensHelper.isValue(nextTerm) || tokensHelper.isFunction(nextTerm))
            );
        },
        action: multiplyAfter
    },
    {
        // adding an identifier or a value before an opening parenthesis
        predicate(previous, next) {
            const previousTerm = terms[previous];
            return (
                next === 'LPAR' &&
                (tokensHelper.isValue(previousTerm) ||
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
        // adding a digit before an identifier
        predicate(previous, next) {
            const previousTerm = terms[previous];
            const nextTerm = terms[next];
            return tokensHelper.isDigit(previousTerm) && tokensHelper.isIdentifier(nextTerm);
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
 * Apply a list of strategies to a value with respect to the previous and next tokens.
 * @param {string} value - The value to modify if a strategy matches.
 * @param {token} previous - The previous token.
 * @param {token} next - The next token.
 * @param {valueStrategy[]} strategies - The list of strategies to apply.
 * @returns {string} - Returns the value modified if one of the strategies matched.
 */
export function applyValueStrategies(value, previous, next, strategies) {
    strategies.every(strategy => {
        if (strategy.predicate(previous, next)) {
            value = strategy.action(value);
            return false;
        }
        return true;
    });
    return value;
}

/**
 * @callback tokenPredicate
 * @param {string} previous - The previous token.
 * @param {string} next - The next token.
 * @returns {boolean} - Returns `true` if both the given tokens match the predicate; returns `false` otherwise.
 */

/**
 * @callback valueModifier
 * @param {string} value - The value to modify.
 * @returns {string} - Returns the modified value.
 */

/**
 * @typedef {object} valueStrategy
 * @property {tokenPredicate} predicate
 * @property {valueModifier} action
 */
