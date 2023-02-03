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

import { terms } from './terms.js';
import tokensHelper from './tokens.js';
import expressionHelper from './expression.js';
import tokenizerFactory from './tokenizer.js';
import mathsEvaluatorFactory from './mathsEvaluator.js';

/**
 * Regex that matches the prefixed function operators
 * @type {RegExp}
 */
const rePrefixedTerm = /^@[a-zA-Z_]\w*$/;

/**
 * Name of the variable that contains the last result
 * @type {string}
 */
const lastResultVariable = terms.ANS.value;

/**
 * Name of the variable that contains the memory
 * @type {string}
 */
const memoryVariable = terms.MEM.value;

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
const prefixStrategies = [
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
            return previous === 'RPAR' && (tokensHelper.isValue(nextTerm) || tokensHelper.isFunction(nextTerm));
        },
        action: multiplyBefore
    },
    {
        // adding an identifier after a value
        predicate(previous, next) {
            const previousTerm = terms[previous];
            const nextTerm = terms[next];
            return tokensHelper.isValue(previousTerm) && tokensHelper.isIdentifier(nextTerm);
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
const suffixStrategies = [
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
function applyStrategies(value, previous, next, strategies) {
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
 * Defines the engine for a calculator
 * @param {object} [config]
 * @param {string} [config.expression=''] - The current expression
 * @param {number} [config.position=0] - The current position in the expression (i.e. the position of the caret)
 * @param {object} [config.variables] - An optional list of variables
 * @param {object} [config.maths] - An optional config for the maths evaluator (@see mathsEvaluator)
 * @returns {calculator}
 */
function engineFactory({ expression = '', position = 0, variables = {}, maths = {} } = {}) {
    /**
     * The list of event listeners
     * @type {Map}
     */
    const events = new Map();

    /**
     * A list of variables that can be used in the expression
     * @type {Map}
     */
    const registry = new Map();

    /**
     * A list of registered commands that can be used inside the calculator
     * @type {Map}
     */
    const commands = new Map();

    /**
     * The tokenizer utilized to split down the expression
     * @type {calculatorTokenizer}
     */
    const tokenizer = tokenizerFactory();

    /**
     * The list of tokens extracted from the expression
     * @type {Array|null}
     */
    let tokens = null;

    /**
     * Maths expression parser.
     * @type {function}
     */
    let mathsEvaluator;

    /**
     * Engine API
     * @type {object}
     */
    const calculatorApi = {
        /**
         * Registers an event listener.
         * @param {string} name - The name of the event to listen to.
         * @param {function} listener - The listener to call when the event happen.
         * @returns {calculator} - Chains the instance.
         */
        on(name, listener) {
            if ('undefined' !== typeof name && 'function' === typeof listener) {
                let listeners = events.get(name);

                if (!listeners) {
                    listeners = new Set();
                    events.set(name, listeners);
                }

                listeners.add(listener);
            }

            return this;
        },

        /**
         * Removes an event listener.
         * @param {string} name - The name of the event to free.
         * @param {function} listener - The listener to remove from the list.
         * @returns {calculator} - Chains the instance.
         */
        off(name, listener = null) {
            if ('undefined' === typeof name) {
                events.clear();
                return this;
            }

            const listeners = events.get(name);
            if (!listeners) {
                return this;
            }

            if (!listener) {
                listeners.clear();
                return this;
            }

            listeners.delete(listener);
            return this;
        },

        /**
         * Triggers an event, calling all listeners in order.
         * @param {string} name - The name of the event to trigger.
         * @param {...*} args - Optional parameters to pass to each listener.
         * @returns {calculator} - Chains the instance.
         */
        trigger(name, ...args) {
            if ('undefined' === typeof name || !events.has(name)) {
                return this;
            }

            const listeners = [...events.get(name)];
            listeners.forEach(listener => listener.apply(this, args));

            return this;
        },

        /**
         * Sets up the mathsEvaluator.
         * The supplied configuration will be merged with the maths configuration given at creation time.
         * @param {object} config - Config for the maths evaluator (@see mathsEvaluator)
         * @returns {calculator}
         * @fires mathsevaluatorconfigure
         */
        configureMathsEvaluator(config = {}) {
            mathsEvaluator = mathsEvaluatorFactory(Object.assign(maths, config));
            this.trigger('mathsevaluatorconfigure', config);
            return this;
        },

        /**
         * Sets the engine to process the angles in degree (`true`) or in radian ('false').
         * @param {boolean} degree - The state of the degree mode.
         * @returns {calculator}
         * @fires mathsevaluatorconfigure
         */
        setDegreeMode(degree = true) {
            return this.configureMathsEvaluator({ degree });
        },

        /**
         * Tells if the engine process the angles in degree (`true`) or in radian ('false').
         * @returns {boolean} - Whether the engine processes the angles in degree (`true`) or in radian ('false').
         */
        isDegreeMode() {
            return !!maths.degree;
        },

        /**
         * Gets access to the mathsEvaluator
         * @returns {function}
         */
        getMathsEvaluator() {
            return mathsEvaluator;
        },

        /**
         * Gets access to the tokenizer
         * @returns {calculatorTokenizer}
         */
        getTokenizer() {
            return tokenizer;
        },

        /**
         * Returns the current expression
         * @returns {string}
         */
        getExpression() {
            return expression;
        },

        /**
         * Changes the current expression
         * @param {string} expr
         * @returns {calculator}
         * @fires expressionchange after the expression has been changed
         */
        setExpression(expr) {
            expression = String(expr || '');
            tokens = null;

            this.trigger('expressionchange', expression);

            return this;
        },

        /**
         * Gets the current position inside the expression
         * @returns {number}
         */
        getPosition() {
            return position;
        },

        /**
         * Sets the current position inside the expression
         * @param {number|string} pos
         * @returns {calculator}
         * @fires positionchange after the position has been changed
         */
        setPosition(pos) {
            position = Math.max(0, Math.min(parseInt(pos, 10) || 0, expression.length));

            this.trigger('positionchange', position);

            return this;
        },

        /**
         * Gets the tokens from the current expression
         * @returns {token[]}
         */
        getTokens() {
            if (tokens === null) {
                tokens = tokenizer.tokenize(expression);
            }

            return tokens;
        },

        /**
         * Gets the token at the current position from the current expression
         * @returns {token|null} Returns the token at the current position, or null if none
         */
        getToken() {
            const tokensList = this.getTokens();
            const index = this.getTokenIndex();

            return tokensList[index] || null;
        },

        /**
         * Gets token index from the current position in the expression.
         * @returns {number} Returns the index of the token at the current position.
         */
        getTokenIndex() {
            let index = 0;
            this.getTokens().forEach((token, idx) => {
                if (position >= token.offset) {
                    index = idx;
                }
            });

            return index;
        },

        /**
         * Checks if a variable is registered
         * @param {string} name
         * @returns {Boolean}
         */
        hasVariable(name) {
            return registry.has(name);
        },

        /**
         * Gets a variable defined for the expression.
         * @param {string} name - The variable name
         * @returns {mathsExpression} The value. Can be another expression.
         */
        getVariable(name) {
            return registry.get(name);
        },

        /**
         * Gets the value of a variable.
         * @param {string} name - The variable name
         * @returns {string|number|Decimal} The computed value, or 0 if the variable does not exist.
         */
        getVariableValue(name) {
            const variable = registry.get(name);
            if (!variable) {
                return 0;
            }
            return variable.result;
        },

        /**
         * Sets a variable that can be used by the expression.
         * @param {string} name - The variable name
         * @param {string|number|mathsExpression} value - The value. Can be another expression.
         * @returns {calculator}
         * @fires variableadd after the variable has been set
         */
        setVariable(name, value) {
            try {
                value = mathsEvaluator(value);
            } catch (err) {
                const expr = (value && value.expression) || value;
                value = mathsEvaluator('0');
                value.expression = expr;
            }

            registry.set(name, value);

            this.trigger('variableadd', name, value);

            return this;
        },

        /**
         * Deletes a variable defined for the expression.
         * @param {string} name - The variable name
         * @returns {calculator}
         * @fires variabledelete after the variable has been deleted
         */
        deleteVariable(name) {
            registry.delete(name);

            this.trigger('variabledelete', name);

            return this;
        },

        /**
         * Gets the list of variables defined for the expression.
         * @returns {object} The list of defined variables.
         */
        getVariables() {
            const defs = {};
            registry.forEach((value, name) => (defs[name] = value));
            return defs;
        },

        /**
         * Gets the values for the variables defined for the expression.
         * @returns {object} The list of variable values.
         */
        getVariableValues() {
            const defs = {};
            registry.forEach((value, name) => (defs[name] = value.result));
            return defs;
        },

        /**
         * Sets a list of variables that can be used by the expression.
         * @param {object} defs - A list variables to set.
         * @returns {calculator}
         * @fires variableadd after each variable has been set
         */
        setVariables(defs) {
            Object.keys(defs).forEach(name => this.setVariable(name, defs[name]));
            return this;
        },

        /**
         * Deletes all variables defined for the expression.
         * @returns {calculator}
         * @fires variabledelete after the variables has been deleted
         */
        deleteVariables() {
            registry.clear();

            this.trigger('variabledelete', null);

            this.setLastResult('0');
            this.clearMemory();

            return this;
        },

        /**
         * Sets the value of the last result
         * @param {string|number|mathsExpression} [result='0']
         * @returns {calculator}
         */
        setLastResult(result) {
            if (!result || expressionHelper.containsError(result)) {
                result = '0';
            }

            this.setVariable(lastResultVariable, result);

            return this;
        },

        /**
         * Gets the value of the last result
         * @returns {mathsExpression}
         */
        getLastResult() {
            return this.getVariable(lastResultVariable);
        },

        /**
         * Sets the value of the last result into the memory
         * @returns {calculator}
         */
        setMemory() {
            this.setVariable(memoryVariable, this.getLastResult());

            return this;
        },

        /**
         * Gets the value of the memory
         * @returns {mathsExpression}
         */
        getMemory() {
            return this.getVariable(memoryVariable);
        },

        /**
         * Clears the value of the memory
         * @returns {calculator}
         */
        clearMemory() {
            this.setVariable(memoryVariable, 0);

            return this;
        },

        /**
         * Checks if a command is registered
         * @param {string} name
         * @returns {Boolean}
         */
        hasCommand(name) {
            return commands.has(name);
        },

        /**
         * Gets the action for a registered command
         * @param {string} name
         * @returns {function} The action for the registered command
         */
        getCommand(name) {
            return commands.get(name);
        },

        /**
         * Registers a command
         * @param {string} name
         * @param {function} action
         * @returns {calculator}
         * @fires commandadd after the command has been set
         */
        setCommand(name, action) {
            commands.set(name, action);

            this.trigger('commandadd', name);

            return this;
        },

        /**
         * Delete a registered command
         * @param {string} name
         * @returns {calculator}
         * @fires commanddelete after the command has been deleted
         */
        deleteCommand(name) {
            commands.delete(name);

            this.trigger('commanddelete', name);

            return this;
        },

        /**
         * Gets the list of registered commands
         * @returns {object} The list of registered commands
         */
        getCommands() {
            const defs = {};
            commands.forEach((value, name) => (defs[name] = value));
            return defs;
        },

        /**
         * Registers a list of commands.
         * @param {object} defs - A list command to set.
         * @returns {calculator}
         * @fires commandadd after each command has been registered
         */
        setCommands(defs) {
            Object.keys(defs).forEach(name => this.setCommand(name, defs[name]));
            return this;
        },

        /**
         * Deletes all commands from the calculator.
         * @returns {calculator}
         * @fires commanddelete after the commands has been deleted
         */
        deleteCommands() {
            commands.clear();

            this.trigger('commanddelete', null);

            return this;
        },

        /**
         * Inserts a term in the expression at the current position
         * @param {string} name - The name of the term to insert
         * @param {object} term - The definition of the term to insert
         * @returns {calculator}
         * @fires termerror if the term to add is invalid
         * @fires termadd when the term has been added
         */
        addTerm(name, term) {
            if ('object' !== typeof term || 'undefined' === typeof term.value) {
                return this.trigger('termerror', new TypeError(`Invalid term: ${name}`));
            }

            const tokensList = this.getTokens();
            const index = this.getTokenIndex();
            const currentToken = tokensList[index];

            // will replace the current term if:
            // - it is a 0, and the term to add is not an operator nor a dot
            // - it is the last result, and the term to add is not an operator
            if (
                !tokensHelper.isOperator(term.type) &&
                !rePrefixedTerm.test(term.value) &&
                tokensList.length === 1 &&
                ((currentToken.type === 'NUM0' && name !== 'DOT') || currentToken.type === 'ANS')
            ) {
                this.replace(term.value);
            } else {
                let previousToken = index > 0 && tokensList[index - 1];
                let nextToken = currentToken;
                let value = term.value;
                let at = position;

                // we need a position at token boundaries, either on the start or on the end
                if (currentToken && at > currentToken.offset) {
                    at = currentToken.offset + currentToken.text.length;
                    previousToken = currentToken;
                    nextToken = tokensList[index + 1];
                }

                // append the appropriate separator to the term to add
                if (expression) {
                    if (previousToken) {
                        value = applyStrategies(value, previousToken.type, name, prefixStrategies);
                    }
                    if (nextToken) {
                        value = applyStrategies(value, name, nextToken.type, suffixStrategies);
                    }
                }

                // trim extraneous spaces
                if (value.startsWith(' ') && expression.charAt(at - 1) === ' ') {
                    value = value.trimStart();
                }
                if (value.endsWith(' ') && expression.charAt(at) === ' ') {
                    value = value.trimEnd();
                }

                this.insert(value, at);
            }

            this.trigger('termadd', name, term);

            return this;
        },

        /**
         * Inserts a term in the expression at the current position
         * @param {string} name - The name of the term to insert
         * @returns {calculator}
         * @fires termerror if the term to add is invalid
         * @fires termadd when the term has been added
         */
        useTerm(name) {
            const prefixed = rePrefixedTerm.test(name);
            if (prefixed) {
                name = name.substring(1);
            }

            let term = terms[name];

            if ('undefined' === typeof term) {
                return this.trigger('termerror', new TypeError(`Invalid term: ${name}`));
            }

            if (prefixed) {
                term = Object.assign({}, term);
                term.value = `@${term.value}`;
            }

            return this.addTerm(name, term);
        },

        /**
         * Inserts a list of terms in the expression at the current position
         * @param {String|String[]} names - The names of the terms to insert.
         *                                  Could be either an array of names or a list separated by spaces.
         * @returns {calculator}
         * @fires termerror if a term to add is invalid
         * @fires termadd when a term has been added
         */
        useTerms(names) {
            if ('string' === typeof names) {
                names = names.split(/\s+/);
            }

            names.forEach(name => this.useTerm(name));

            return this;
        },

        /**
         * Inserts a variable as a term in the expression at the current position
         * @param {string} name - The name of the variable to insert
         * @returns {calculator}
         * @fires termerror if the term to add is invalid
         * @fires termadd when the term has been added
         */
        useVariable(name) {
            if (!registry.has(name)) {
                return this.trigger('termerror', new TypeError(`Invalid variable: ${name}`));
            }

            return this.addTerm(`VAR_${name.toUpperCase()}`, {
                label: name,
                value: name,
                type: 'variable'
            });
        },

        /**
         * Calls a command
         * @param {string} name - The name of the called command
         * @param {...*} args - additional params for the command
         * @returns {calculator}
         * @fires command with the name and the parameters of the command
         * @fires command-<name> with the parameters of the command
         * @fires commanderror if the command is invalid
         */
        useCommand(name, ...args) {
            const action = commands.get(name);

            if ('function' !== typeof action) {
                return this.trigger('commanderror', new TypeError(`Invalid command: ${name}`));
            }

            action.apply(this, args);

            this.trigger('command', name, ...args);

            this.trigger(`command-${name}`, ...args);

            return this;
        },

        /**
         * Replaces the expression and move the cursor at the end.
         * @param {string} newExpression - The new expression to set
         * @param {number|string} [newPosition=newExpression.length] - The new position to set
         * @returns {calculator}
         * @fires replace after the expression has been replaced
         */
        replace(newExpression, newPosition) {
            const oldExpression = expression;
            const oldPosition = position;

            this.setExpression(newExpression).setPosition(
                'undefined' !== typeof newPosition ? newPosition : expression.length
            );

            this.trigger('replace', oldExpression, oldPosition);

            return this;
        },

        /**
         * Inserts a sub-expression in the current expression and move the cursor.
         * @param {string} subExpression - The sub-expression to insert
         * @param {number} [at=position] - The new position to set
         * @returns {calculator}
         * @fires insert after the expression has been inserted
         */
        insert(subExpression, at) {
            const oldExpression = expression;
            const oldPosition = position;

            if ('number' !== typeof at) {
                at = position;
            }

            this.setExpression(expression.substring(0, at) + subExpression + expression.substring(at));
            this.setPosition(at + subExpression.length);

            this.trigger('insert', oldExpression, oldPosition);

            return this;
        },

        /**
         * Clears the expression
         * @returns {calculator}
         * @fires clear after the expression has been cleared
         */
        clear() {
            this.setExpression('').setPosition(0);

            this.trigger('clear');

            return this;
        },

        /**
         * Resets the calculator
         * @returns {calculator}
         * @fires reset after the calculator has been reset
         */
        reset() {
            this.deleteVariables();
            this.clear();

            this.trigger('reset');

            return this;
        },

        /**
         * Evaluates the current expression
         * @returns {mathsExpression|null}
         * @fires evaluate when the expression has been evaluated
         * @fires syntaxerror when the expression contains an error
         */
        evaluate() {
            let result = null;
            try {
                if (expression.trim()) {
                    const vars = this.getVariableValues();
                    result = mathsEvaluator(expression, vars);
                } else {
                    result = mathsEvaluator('0');
                }

                this.setLastResult(result);

                this.trigger('evaluate', result);
            } catch (e) {
                this.trigger('syntaxerror', e);
            }

            return result;
        },

        /**
         * Renders the current expression into a list of terms.
         * This list can then be applied to a template.
         * @returns {renderTerm[]}
         * @fires render when the expression has been rendered
         */
        render() {
            const renderedTerms = expressionHelper.render(this.getTokens(), this.getVariable(), tokenizer);

            this.trigger('render', renderedTerms);

            return renderedTerms;
        }
    };

    calculatorApi
        .configureMathsEvaluator()
        .setLastResult('0')
        .setMemory()
        .setPosition(position)
        .setVariables(variables)
        .setCommand('clear', () => calculatorApi.clear())
        .setCommand('clearAll', () => calculatorApi.reset())
        .setCommand('execute', () => calculatorApi.evaluate())
        .setCommand('var', name => calculatorApi.useVariable(name))
        .setCommand('term', name => calculatorApi.useTerms(name))
        .setCommand('degree', () => calculatorApi.setDegreeMode(true))
        .setCommand('radian', () => calculatorApi.setDegreeMode(false))
        .setCommand('remind', () => calculatorApi.useVariable(memoryVariable))
        .setCommand('remindStore', () => calculatorApi.setMemory())
        .setCommand('remindClear', () => calculatorApi.clearMemory());

    return calculatorApi;
}

export default engineFactory;

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

/**
 * Notifies the maths evaluator has been configured.
 * @event mathsevaluatorconfigure
 * @param {object} config - Config for the maths evaluator (@see mathsEvaluator)
 */

/**
 * Notifies the expression has changed.
 * @event expressionchange
 * @param {string} expression - The new expression.
 */

/**
 * Notifies the position inside the expression has changed.
 * @event positionchange
 * @param {number} position - The new position.
 */

/**
 * Notifies a variable has been added.
 * @event variableadd
 * @param {string} name - The name of the new variable.
 * @param {string} value - The value of the new variable.
 */

/**
 * Notifies a variable has been removed.
 * @event variabledelete
 * @param {string} name - The name of the removed variable.
 */

/**
 * Notifies a command has been registered.
 * @event commandadd
 * @param {string} name - The name of the new command.
 */

/**
 * Notifies a command has been removed.
 * @event commanddelete
 * @param {string} name - The name of the removed command.
 */

/**
 * Notifies an error occurred with a command.
 * @event commanderror
 * @param {TypeError} err - The error object.
 */

/**
 * Notifies a command has been invoked.
 * @event command
 * @param {string} name - The name of the called command
 * @param {...*} args - Additional params for the command
 */

/**
 * Notifies a particular command has been invoked.
 * @event command-<name>
 * @param {...*} args - Additional params for the command
 */

/**
 * Notifies a term has been added to the expression.
 * @event termadd
 * @param {string} name - The name of the added term
 * @param {object} term - The descriptor of the added term
 */

/**
 * Notifies an errors occurred with a term added the expression.
 * @event termerror
 * @param {TypeError} err - The error object.
 */

/**
 * Notifies the expression has been replaced.
 * @event replace
 * @param {string} expression - The replaced expression
 * @param {number} position - The replaced position
 */

/**
 * Notifies a sub-expression has been inserted.
 * @event insert
 * @param {string} expression - The replaced expression
 * @param {number} position - The replaced position
 */

/**
 * Notifies the expression has been cleared.
 * @event clear
 */

/**
 * Notifies the calculator has been reset.
 * @event reset
 */

/**
 * Notifies the expression has been evaluated.
 * @event evaluate
 * @param {mathsExpression} result - The result of the expression.
 */

/**
 * Notifies the expression has a syntax error.
 * @event syntaxerror
 * @param {Error} err - The error object.
 */

/**
 * Notifies the expression has been rendered into a list of terms.
 * @event render
 * @param {renderTerm[]} terms - The list of rendered terms.
 */
