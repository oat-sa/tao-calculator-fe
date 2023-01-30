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

import _ from 'lodash';
import { terms, types } from './terms';
import tokensHelper from './tokens';
import tokenizerFactory from './tokenizer';

/**
 * @typedef {term} renderTerm - Represents a renderable tokenizable term
 * @property {string} startExponent - Identifier for the start of the exponent (will produce exponent notation for the term)
 * @property {string[]} endExponent - Identifiers for the end of the exponent (will finish exponent notation for the term)
 * @property {boolean} prefixed - Tells if the term is prefixed (i.e. function treated as binary operator)
 * @property {boolean} elide - Allows to hide the term when operands exist on each side
 */

/**
 * @typedef {object} extractTerms - Represents an extraction of terms
 * @property {renderTerm[]} extract - The list of extracted terms
 * @property {number} length - The actual number of extracted terms, including the nested ones
 */

/**
 * Name of the variable that contains the last result
 * @type {string}
 */
const lastResultVariableName = terms.ANS.value;

/**
 * Regex that matches the prefixed function operators
 * @type {RegExp}
 */
const rePrefixedTerm = /^@[a-zA-Z_]\w*$/;

/**
 * Regex that matches the usual error tokens in a result
 * @type {RegExp}
 */
const reErrorValue = /(NaN|[+-]?Infinity)/;

/**
 * Regex that matches the last result variable
 * @type {RegExp}
 */
const reAnsVar = new RegExp(`\\b${lastResultVariableName}\\b`, 'g');

/**
 * List of tokens representing sign or sum
 * @type {String[]}
 */
const signOperators = ['NEG', 'POS', 'SUB', 'ADD'];

/**
 * List of tokens representing sub exponent parts to continue
 * @type {String[]}
 */
const continueExponent = ['POW', 'NTHRT'];

/**
 * Default number of significant digits used to round displayed variables
 * @type {number}
 */
const defaultDecimalDigits = 5;

/**
 * List of helpers that apply on expression
 * @type {object}
 */
const expressionHelper = {
    /**
     * Checks if an expression contains an error token
     * @param {string|number|object} expression
     * @returns {boolean}
     */
    containsError(expression) {
        return reErrorValue.test(tokensHelper.stringValue(expression));
    },

    /**
     * Replace the last result variable by a particular value in an expression
     * @param {string|number|object} expression
     * @param {string|number|object} value
     * @returns {string}
     */
    replaceLastResult(expression, value) {
        return tokensHelper.stringValue(expression).replace(reAnsVar, tokensHelper.stringValue(value || '0'));
    },

    /**
     * Rounds the value of a variable
     * @param {object} variable
     * @param {number} [decimalDigits=5]
     * @returns {string}
     */
    roundVariable(variable, decimalDigits = defaultDecimalDigits) {
        const fullString = tokensHelper.stringValue(variable);
        const result = variable && variable.result;
        let resultString = fullString;

        if ('undefined' !== typeof result) {
            if (result.toExponential && resultString.indexOf(terms.EXP10.value) > 0) {
                resultString = result.toExponential(decimalDigits).toString();
            } else if (result.toDecimalPlaces && resultString.indexOf(terms.DOT.value) > 0) {
                resultString = result.toDecimalPlaces(decimalDigits).toString();
            }

            if (resultString.length < fullString.length) {
                resultString += terms.ELLIPSIS.value;
            } else {
                resultString = fullString;
            }
        }
        return resultString;
    },

    /**
     * Rounds the value of the last result variable
     * @param {object} variables
     * @param {number} [decimalDigits=5]
     * @returns {object}
     */
    roundLastResultVariable(variables, decimalDigits) {
        if (variables && 'undefined' !== typeof variables[lastResultVariableName]) {
            variables[lastResultVariableName] = expressionHelper.roundVariable(
                variables[lastResultVariableName],
                decimalDigits
            );
        }
        return variables;
    },

    /**
     * Replace sign operators by a proper symbol
     * @param {string|number|object} expression
     * @returns {string}
     */
    renderSign(expression) {
        return tokensHelper
            .stringValue(expression)
            .replace(terms.SUB.value, terms.NEG.label)
            .replace(terms.ADD.value, terms.POS.label);
    },

    /**
     * Renders an expression into a list of terms. This list can then be applied to a template.
     * @param {string|number|object|token[]} expression
     * @param {object} [variables]
     * @param {calculatorTokenizer} [tokenizer]
     * @returns {renderTerm[]}
     */
    render(expression, variables = {}, tokenizer = null) {
        let tokens = expression;
        const exponents = [];
        const renderedTerms = [];
        let previous;

        /**
         * Transform an operator to a sign
         * @param {renderTerm} term
         * @param {string} token
         */
        function toSignOperator(term, token) {
            if (
                !previous ||
                tokensHelper.isModifier(previous.type) ||
                previous.token === 'LPAR' ||
                previous.token === 'EXP10'
            ) {
                term.label = terms[token].label;
                term.token = token;
            }
        }

        // the expression might be already tokenized, if not we need to tokenize it
        if (!Array.isArray(tokens)) {
            // we need a valid tokenizer, so if none is provided we must build one
            if (!tokenizer || !tokenizer.tokenize) {
                tokenizer = tokenizerFactory();
            }
            tokens = tokenizer.tokenize(expression);
        }

        // each token needs to be translated into a displayable term
        tokens.forEach((token, index) => {
            const registeredTerm = terms[token.type];

            /**
             * @type {renderTerm}
             */
            const term = {
                type: token.type,
                token: token.type,
                value: token.value,
                label: token.value,
                exponent: null,
                startExponent: null,
                endExponent: [],
                prefixed: rePrefixedTerm.test(token.value),
                elide: false
            };

            if (registeredTerm) {
                _.merge(term, registeredTerm);

                // always display the actual value of the last result variable
                // also takes care of the value's sign
                if (term.value === lastResultVariableName && 'undefined' !== typeof variables[term.value]) {
                    term.label = expressionHelper.render(variables[term.value], variables, tokenizer);
                }
            } else if (term.token === 'term') {
                // unspecified token can be a variable
                if ('undefined' !== typeof variables[term.value]) {
                    term.type = 'variable';
                } else {
                    term.type = 'unknown';
                }
            }

            // take care of the value's sign
            if (term.token === 'SUB') {
                toSignOperator(term, 'NEG');
            } else if (term.token === 'ADD') {
                toSignOperator(term, 'POS');
            }

            renderedTerms.push(term);

            // exponents will be processed in a second pass
            // for now we just need to keep track of the position
            if (term.exponent) {
                exponents.push(index);
            }

            previous = term;
        });

        // if any exponent has been discovered, we need to process them now
        exponents.forEach(index => {
            const term = renderedTerms[index];
            if (term.exponent === 'left' && index > 0) {
                exponentOnTheLeft(renderedTerms, index);
            } else if (term.exponent === 'right' && index < renderedTerms.length - 1) {
                exponentOnTheRight(renderedTerms, index);
            }
        });

        return renderedTerms;
    },

    /**
     * Nests the exponents so that the terms can be easily rendered.
     * @param {renderTerm[]} renderedTerms - The flat list of rendered terms.
     * @returns {renderTerm[]} - Returns a possibly nested rendered terms.
     */
    nestExponents(renderedTerms) {
        const nestedTerms = [];
        const len = renderedTerms.length;
        let index = 0;

        while (index < len) {
            let term = renderedTerms[index];

            if (term.startExponent) {
                const { extract, length } = extractExponent(renderedTerms, index);
                term = {
                    type: types.exponent,
                    value: extract
                };
                index += length;
            } else {
                index++;
            }

            nestedTerms.push(term);
        }

        return nestedTerms;
    }
};

/**
 * Extracts sub-expressions for exponent so that the terms can be easily rendered.
 * @param {renderTerm[]} renderedTerms - The flat list of rendered terms.
 * @param {number} index
 * @returns {extractTerms} - Returns the terms representing the exponent.
 */
function extractExponent(renderedTerms, index = 0) {
    const extract = [];
    const len = renderedTerms.length;
    const first = renderedTerms[index];
    const level = first && first.startExponent;
    const startIndex = index;

    let done = false;
    while (!done && index < len) {
        const term = renderedTerms[index];

        if (term.startExponent && term.startExponent !== level) {
            const nest = extractExponent(renderedTerms, index);
            extract.push({
                type: types.exponent,
                value: nest.extract
            });
            index += nest.length;
        } else {
            extract.push(term);
            index++;
        }

        done = term.endExponent.includes(level);
    }

    const length = index - startIndex;
    return { extract, length };
}

/**
 * Search for the full operand on the left, then tag the edges with exponent flags
 * @param {renderTerm[]} renderedTerms
 * @param {number} index
 */
function exponentOnTheLeft(renderedTerms, index) {
    const identifier = `left-${index}`;
    let parenthesis = 0;
    let next = renderedTerms[index];
    let term = renderedTerms[--index];

    /**
     * Simply moves the cursor to the next term to examine.
     * Here the move is made from the right to the left.
     */
    function nextTerm() {
        next = term;
        term = renderedTerms[--index];
    }

    // only take care of actual operand value or sub expression (starting from the right)
    if (term && (tokensHelper.isOperand(term.type) || term.token === 'RPAR')) {
        term.endExponent.push(identifier);

        if (term.token === 'RPAR') {
            // closing parenthesis, we need to find the opening parenthesis
            parenthesis++;
            while (index > 0 && parenthesis > 0) {
                nextTerm();

                if (term.token === 'RPAR') {
                    parenthesis++;
                } else if (term.token === 'LPAR') {
                    parenthesis--;
                }
            }

            // a function could be attached to the sub expression, if so we must keep the link
            // however, the prefixed functions are particular as they act as a binary operators,
            // and therefore are not considered as function here
            if (index > 0 && tokensHelper.isFunction(renderedTerms[index - 1]) && !renderedTerms[index - 1].prefixed) {
                nextTerm();
            }
        } else if (tokensHelper.isDigit(term.type)) {
            // chain of digits should be treated as a single operand
            while (index && tokensHelper.isDigit(term.type)) {
                nextTerm();
            }
            // if the end of the chain has been overflown, we must step back one token
            if (!tokensHelper.isDigit(term.type)) {
                term = next;
            }
        }
        term.startExponent = identifier;
    }
}

/**
 * Search for the full operand on the right, then tag the edges with exponent flags
 * @param {renderTerm[]} renderedTerms
 * @param {number} index
 */
function exponentOnTheRight(renderedTerms, index) {
    const identifier = `right-${index}`;
    const last = renderedTerms.length - 1;
    const startAt = index;
    let parenthesis = 0;
    let previous = renderedTerms[index];
    let term = renderedTerms[++index];
    let shouldContinue;

    /**
     * Simply moves the cursor to the next term to examine.
     * Here the move is made from the left to the right.
     */
    function nextTerm() {
        previous = term;
        term = renderedTerms[++index];
    }

    /**
     * Simply moves back the cursor to the previous term.
     * Here the move is made from the right to the left.
     */
    function previousTerm() {
        term = previous;
        previous = renderedTerms[--index];
    }

    // only take care of actual operand value or sub expression (starting from the left)
    if (
        term &&
        (tokensHelper.isOperand(term.type) || term.token === 'LPAR' || signOperators.indexOf(term.token) >= 0)
    ) {
        term.startExponent = identifier;

        // we use an internal loop as exponents could be chained
        do {
            shouldContinue = false;

            // functions are attached to an operand, and this link should be kept
            while (index < last && (tokensHelper.isFunction(term.type) || signOperators.indexOf(term.token) >= 0)) {
                nextTerm();
            }

            // if the end has been reached, step back one token
            if (!term) {
                previousTerm();
            }

            if (term.token === 'LPAR') {
                // opening parenthesis, we need to find the closing parenthesis
                parenthesis++;
                while (index < last && parenthesis > 0) {
                    nextTerm();

                    if (term.token === 'LPAR') {
                        parenthesis++;
                    } else if (term.token === 'RPAR') {
                        parenthesis--;
                    }
                }
            } else if (tokensHelper.isDigit(term.type)) {
                // chain of digits should be treated as a single operand
                while (index < last && tokensHelper.isDigit(term.type)) {
                    nextTerm();
                }
                // if the end of the chain has been overflown, we must step back one token
                if (!term || !tokensHelper.isDigit(term.type)) {
                    previousTerm();
                }
            }

            // factorial is a special case, as the operator can be placed either on the right or on the left
            // in any case it should be attached to its operand
            while (index < last && renderedTerms[index + 1].token === 'FAC') {
                nextTerm();
            }

            // sometimes a sub exponent continues the chain and should be part of the expression to put in exponent
            if (index < last && continueExponent.indexOf(renderedTerms[index + 1].token) >= 0) {
                // the next term should be ignored as we already know it is an exponent operator
                // then the term after have to be set as the current one
                nextTerm();
                nextTerm();
                shouldContinue = true;
            }
        } while (shouldContinue);

        term.endExponent.push(identifier);

        // elide the operator if operands are complete
        if (
            startAt > 0 &&
            startAt < last &&
            renderedTerms[startAt].token === 'POW' &&
            renderedTerms[startAt + 1].startExponent
        ) {
            renderedTerms[startAt].elide = true;
        }
    }
}

export default expressionHelper;
