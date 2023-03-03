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

/**
 * Apply a list of strategies to a token.
 * @param {number} index - The index of the current token
 * @param {token[]} tokens - The list of tokens that represent the expression
 * @param {tokenStrategy[]} strategies - The list of strategies to apply.
 * @returns {tokenChange|null} - The result of the strategy: `null` if cannot apply, or the descriptor of the change
 */
export function applyTokenStrategies(index, tokens, strategies) {
    let result = null;

    strategies.every(strategy => {
        result = strategy(index, tokens);
        return !result;
    });

    return result;
}

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
 * @callback tokenStrategy
 * @param {number} index - The index of the current token
 * @param {token[]} tokens - The list of tokens that represent the expression
 * @returns {tokenChange|null} - The result of the strategy: `null` if cannot apply, or the descriptor of the change
 */

/**
 * @typedef {object} valueStrategy
 * @property {tokenPredicate} predicate
 * @property {valueModifier} action
 */

/**
 * @typedef {object} tokenChange
 * @property {string} value - The token to insert
 * @property {number} offset - The offset where insert the token
 * @property {number} length - The length of text to replace
 * @property {number} move - The move to apply from the current position
 */

/**
 * @typedef {import('../tokenizer.js').token} token
 */
