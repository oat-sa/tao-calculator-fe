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

import registeredTerms from './terms.js';
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
 * Defines the engine for a calculator
 * @param {object} [config]
 * @param {string} [config.expression=''] - The current expression
 * @param {number} [config.position=0] - The current position in the expression (i.e. the position of the caret)
 * @param {object} [config.maths] - Optional config for the maths evaluator (@see mathsEvaluator)
 * @returns {calculator}
 */
function engineFactory({ expression = '', position = 0, maths = {} } = {}) {
    /**
     * Maths expression parser.
     * @type {function}
     */
    let mathsEvaluator = mathsEvaluatorFactory(maths);

    /**
     * The list of event listeners
     * @type {Map}
     */
    const events = new Map();

    /**
     * A list of variables that can be used in the expression
     * @type {Map}
     */
    const variables = new Map();

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

            /**
             * @event expressionchange
             * @param {string} expression
             */
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

            /**
             * @event positionchange
             * @param {number} position
             */
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
            return variables.has(name);
        },

        /**
         * Gets a variable defined for the expression.
         * @param {string} name - The variable name
         * @returns {mathsExpression} The value. Can be another expression.
         */
        getVariable(name) {
            return variables.get(name);
        },

        /**
         * Sets a variable that can be used by the expression.
         * @param {string} name - The variable name
         * @param {String|Number|mathsExpression} value - The value. Can be another expression.
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

            variables.set(name, value);

            /**
             * @event variableadd
             * @param {string} name
             * @param {string} value
             */
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
            variables.delete(name);

            /**
             * @event variabledelete
             * @param {string} name
             */
            this.trigger('variabledelete', name);

            return this;
        },

        /**
         * Gets the list of variables defined for the expression.
         * @returns {object} The list of defined variables.
         */
        getVariables() {
            const defs = {};
            variables.forEach(function (value, name) {
                defs[name] = value;
            });

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
            variables.clear();

            /**
             * @event variabledelete
             * @param {null} name
             */
            this.trigger('variabledelete', null);

            this.setLastResult('0');

            return this;
        },

        /**
         * Sets the value of the last result
         * @param {String|Number|mathsExpression} [result='0']
         * @returns {calculator}
         */
        setLastResult(result) {
            if (!result || expressionHelper.containsError(result)) {
                result = '0';
            }

            this.setVariable(registeredTerms.ANS.value, result);

            return this;
        },

        /**
         * Gets the value of the last result
         * @returns {mathsExpression}
         */
        getLastResult() {
            return this.getVariable(registeredTerms.ANS.value);
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

            /**
             * @event commandadd
             * @param {string} name
             */
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

            /**
             * @event commanddelete
             * @param {string} name
             */
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

            /**
             * @event commanddelete
             * @param {null} name
             */
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
                /**
                 * @event termerror
                 * @param {TypeError} err
                 */
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

                if (currentToken && at > currentToken.offset) {
                    at = currentToken.offset + currentToken.text.length;
                    previousToken = currentToken;
                    nextToken = tokensList[index + 1];
                }

                // simply add the term, with potentially spaces around
                if (expression && !tokensHelper.isSeparator(term.type)) {
                    const isIdentifier = tokensHelper.isIdentifier(term.type);
                    const tokenNeedsSpace = token =>
                        tokensHelper.isIdentifier(token) || (isIdentifier && token && !tokensHelper.isSeparator(token));

                    // prepend space when either the term to add or the previous term is an identifier
                    if (tokenNeedsSpace(previousToken) && expression.charAt(at - 1) !== ' ') {
                        value = ` ${value}`;
                    }

                    // append space when either the term to add or the next term is an identifier
                    if (tokenNeedsSpace(nextToken) && expression.charAt(at) !== ' ') {
                        value += ' ';
                    }
                }

                this.insert(value, at);
            }

            /**
             * @event termadd
             * @param {string} name - The name of the added term
             * @param {object} term - The descriptor of the added term
             */
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

            let term = registeredTerms[name];

            if ('undefined' === typeof term) {
                /**
                 * @event termerror
                 * @param {TypeError} err
                 */
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
            if (!variables.has(name)) {
                /**
                 * @event termerror
                 * @param {TypeError} err
                 */
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
                /**
                 * @event commanderror
                 * @param {TypeError} err
                 */
                return this.trigger('commanderror', new TypeError(`Invalid command: ${name}`));
            }

            action.apply(this, args);

            /**
             * @event command
             * @param {string} name - The name of the called command
             * @param {...*} args - additional params for the command
             */
            this.trigger('command', name, ...args);

            /**
             * @event command-<name>
             * @param {...*} args - additional params for the command
             */
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

            /**
             * @event replace
             * @param {string} expression - the replaced expression
             * @param {number} position - the replaced position
             */
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

            /**
             * @event insert
             * @param {string} expression - the replaced expression
             * @param {number} position - the replaced position
             */
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

            /**
             * @event clear
             */
            this.trigger('clear');

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
                    const vars = Object.entries(this.getVariables()).reduce(
                        (a, [key, entry]) => (a[key] = entry.result),
                        {}
                    );

                    result = mathsEvaluator(expression, vars);
                } else {
                    result = mathsEvaluator('0');
                }

                /**
                 * @event evaluate
                 * @param {mathsExpression} result
                 */
                this.trigger('evaluate', result);

                this.setLastResult(result);
            } catch (e) {
                /**
                 * @event syntaxerror
                 * @param {Error} err
                 */
                this.trigger('syntaxerror', e);
            }

            return result;
        }
    };

    calculatorApi
        .setLastResult('0')
        .setPosition(position)
        .setCommand('clear', () => calculatorApi.clear())
        .setCommand('clearAll', () => calculatorApi.deleteVariables().clear())
        .setCommand('execute', () => calculatorApi.evaluate())
        .setCommand('var', name => calculatorApi.useVariable(name))
        .setCommand('term', name => calculatorApi.useTerms(name));

    return calculatorApi;
}

export default engineFactory;
