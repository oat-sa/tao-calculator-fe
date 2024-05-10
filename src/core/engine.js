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

import expressionHelper, { defaultDecimalDigits } from './expression.js';
import mathsEvaluatorFactory from './mathsEvaluator.js';
import {
    applyChangeStrategies,
    applyContextStrategies,
    applyListStrategies,
    applyValueStrategies,
    correctStrategies,
    limitStrategies,
    prefixStrategies,
    replaceExpressionStrategies,
    replaceOperatorStrategies,
    signStrategies,
    suffixStrategies,
    triggerStrategies
} from './strategies/index.js';
import { isPrefixedTerm, terms } from './terms.js';
import tokenizerFactory from './tokenizer.js';
import tokensHelper from './tokens.js';

/**
 * Name of the variable that contains the last result
 * @type {string}
 */
const lastResultVariable = terms.VAR_ANS.value;

/**
 * Name of the variable that contains the memory
 * @type {string}
 */
const memoryVariable = terms.VAR_MEM.value;

/**
 * Match the space separators
 * @type {RegExp}
 */
const reSpace = /\s+/;

/**
 * Defines the engine for a calculator
 * @param {object} [config]
 * @param {string} [config.expression=''] - The current expression
 * @param {number} [config.position=0] - The current position in the expression (i.e. the position of the caret)
 * @param {boolean} [config.instant=false] - Whether the engine computes the expression instantaneously (`true`) or not ('false').
 * @param {boolean} [config.corrector=false] - Whether the engine must correct the expression before the evaluation (`true`) or not ('false').
 * @param {object} [config.variables] - An optional list of variables
 * @param {object} [config.commands] - An optional list of commands
 * @param {object} [config.plugins] - An optional list of plugins
 * @param {object} [config.maths] - An optional config for the maths evaluator (@see mathsEvaluator)
 * @returns {calculator}
 */
function engineFactory({
    expression = '',
    position = null,
    instant = false,
    corrector = false,
    variables = {},
    commands = {},
    plugins = {},
    maths = {}
} = {}) {
    /**
     * The list of event listeners.
     * @type {Map}
     */
    const events = new Map();

    /**
     * A list of variables that can be used in the expression.
     * @type {Map}
     */
    const variablesRegistry = new Map();

    /**
     * A list of registered commands that can be used inside the calculator.
     * @type {Map}
     */
    const commandsRegistry = new Map();

    /**
     * A list of registered plugins that have been added to the calculator.
     * It lists the uninstall callback.
     * @type {Map}
     */
    const pluginsRegistry = new Map();

    /**
     * The tokenizer utilized to split down the expression.
     * @type {calculatorTokenizer}
     */
    const tokenizer = tokenizerFactory();

    /**
     * The list of tokens extracted from the expression.
     * @type {Array|null}
     */
    let tokens = null;

    /**
     * Maths expression parser.
     * @type {function}
     */
    let mathsEvaluator;

    /**
     * Internal state for the engine.
     * @type {object}
     */
    const state = {
        changed: false, // Did the expression change since the last calculation?
        error: false // Do the expression have error?
    };

    /**
     * Engine API
     * @type {object}
     */
    const calculatorApi = {
        /**
         * Registers an event listener.
         * @param {string} names - The name of the event to listen to. It can be a list separated by spaces.
         * @param {function} listener - The listener to call when the event happen.
         * @returns {calculator} - Chains the instance.
         */
        on(names, listener) {
            if ('string' === typeof names && 'function' === typeof listener) {
                names.split(reSpace).forEach(name => {
                    let listeners = events.get(name);

                    if (!listeners) {
                        listeners = new Set();
                        events.set(name, listeners);
                    }

                    listeners.add(listener);
                });
            }

            return this;
        },

        /**
         * Removes an event listener.
         * @param {string} names - The name of the event to free. It can be a list separated by spaces.
         * @param {function} listener - The listener to remove from the list.
         * @returns {calculator} - Chains the instance.
         */
        off(names, listener = null) {
            if ('undefined' === typeof names) {
                events.clear();
                return this;
            }

            if (names && 'string' === typeof names) {
                names.split(reSpace).forEach(name => {
                    const listeners = events.get(name);
                    if (!listeners) {
                        return;
                    }

                    if (listener) {
                        listeners.delete(listener);
                    } else {
                        listeners.clear();
                    }
                });
            }

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
         * @fires configure
         */
        configureMathsEvaluator(config = {}) {
            mathsEvaluator = mathsEvaluatorFactory(Object.assign(maths, config));
            this.trigger('configure', config);
            return this;
        },

        /**
         * Sets the engine to process the angles in degree (`true`) or in radian ('false').
         * @param {boolean} degree - The state of the degree mode.
         * @returns {calculator}
         * @fires configure
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
         * Sets the engine to compute the expression instantaneously (`true`) or not ('false').
         * @param {boolean} mode - The state of the instant mode.
         * @returns {calculator}
         * @fires configure
         */
        setInstantMode(mode = true) {
            instant = mode;
            this.trigger('configure', { instant });
            return this;
        },

        /**
         * Tells if the engine must compute the expression instantaneously (`true`) or not ('false').
         * @returns {boolean} - Whether the engine computes the expression instantaneously (`true`) or not ('false').
         */
        isInstantMode() {
            return !!instant;
        },

        /**
         * Sets the engine to correct the expression before evaluating it (`true`) or not ('false').
         * @param {boolean} mode - The state of the corrector mode.
         * @returns {calculator}
         * @fires configure
         */
        setCorrectorMode(mode = true) {
            corrector = mode;
            this.trigger('configure', { corrector });
            return this;
        },

        /**
         * Tells if the engine must correct the expression before evaluating it (`true`) or not ('false').
         * @returns {boolean} - Whether the engine must correct the expression before evaluating it (`true`) or not ('false').
         */
        isCorrectorMode() {
            return !!corrector;
        },

        /**
         * Tells if the expression has changed since the last calculation.
         * @type {boolean}
         */
        get changed() {
            return state.changed;
        },

        /**
         * Tells if the expression has or produces error.
         * @type {boolean}
         */
        get error() {
            return state.error;
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
         * @fires expression after the expression has been changed
         */
        setExpression(expr) {
            expression = String(expr || '');
            tokens = null;
            state.changed = true;
            state.error = false;

            this.trigger('expression', expression);

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
         * @fires position after the position has been changed
         */
        setPosition(pos) {
            position = Math.max(0, Math.min(parseInt(pos, 10) || 0, expression.length));

            this.trigger('position', position);

            return this;
        },

        /**
         * Moves the current position to the token on the left
         * @returns {calculator}
         * @fires position after the position has been changed
         */
        movePositionLeft() {
            const tokensList = this.getTokens();
            const index = this.getTokenIndex();
            let token = tokensList[index];

            if (token && position > 0) {
                if (token.offset === position) {
                    if (index > 0) {
                        token = tokensList[index - 1];
                    } else {
                        token = null;
                    }
                }
            } else {
                token = null;
            }

            const offset = (token && token.offset) || 0;

            if (offset !== position) {
                this.setPosition(offset);
            }

            return this;
        },

        /**
         * Moves the current position to the token on the right
         * @returns {calculator}
         * @fires position after the position has been changed
         */
        movePositionRight() {
            const tokensList = this.getTokens();
            const index = this.getTokenIndex();
            let token = tokensList[index];
            let offset = expression.length;

            if (token && index < tokensList.length - 1) {
                token = tokensList[index + 1];
                if (token) {
                    offset = token.offset;
                }
            }

            if (offset !== position) {
                this.setPosition(offset);
            }

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
         * Removes the given token from the expression.
         * @param {token} token
         * @returns {calculator}
         * @fires expression after the token has been removed.
         * @fires position if the position has been changed
         */
        deleteToken(token) {
            if (!token) {
                return this;
            }

            const from = token.offset;
            let to = from + token.value.length;
            while (to < expression.length && expression.charAt(to) === ' ') {
                to++;
            }

            this.setExpression(expression.substring(0, from) + expression.substring(to));
            if (position > to) {
                this.setPosition(position + from - to);
            } else if (position > from) {
                this.setPosition(from);
            }

            return this;
        },

        /**
         * Removes tokens from the expression with respect to range given the start and end tokens.
         * @param {token} start
         * @param {token} end
         * @returns {calculator}
         * @fires expression after the token has been removed.
         * @fires position if the position has been changed
         */
        deleteTokenRange(start, end) {
            if (!start || !end) {
                return this;
            }

            const from = start.offset;
            let to = end.offset + end.value.length;
            while (to < expression.length && expression.charAt(to) === ' ') {
                to++;
            }

            this.setExpression(expression.substring(0, from) + expression.substring(to));
            if (position > to) {
                this.setPosition(position + from - to);
            } else if (position > from) {
                this.setPosition(from);
            }

            return this;
        },

        /**
         * Deletes the token on the left
         * @returns {calculator}
         * @fires expression after the token on the left has been removed.
         * @fires position if the position has been changed
         */
        deleteTokenLeft() {
            const tokensList = this.getTokens();
            const index = this.getTokenIndex();
            const token = tokensList[index];

            if (token) {
                if (position > token.offset) {
                    this.deleteToken(token);
                } else {
                    if (index > 0) {
                        this.deleteToken(tokensList[index - 1]);
                    } else if (position > 0) {
                        this.deleteToken(tokensList[0]);
                    }
                }
            }

            return this;
        },

        /**
         * Deletes the token on the right
         * @returns {calculator}
         * @fires expression after the token on the right has been removed.
         * @fires position if the position has been changed
         */
        deleteTokenRight() {
            const tokensList = this.getTokens();
            const index = this.getTokenIndex();
            const token = tokensList[index];
            const next = tokensList[index + 1];

            if (token) {
                if (position >= token.offset + token.value.length) {
                    this.deleteToken(next);
                } else {
                    this.deleteToken(token);
                }
            }

            return this;
        },

        /**
         * Changes the sign for the current token.
         * @returns {calculator}
         * @fires expression after the expression has been updated.
         * @fires position if the position has been changed.
         */
        changeSign() {
            const tokensList = this.getTokens();
            const index = this.getTokenIndex();

            if (expression.trim() !== '0') {
                const result = applyChangeStrategies(index, tokensList, signStrategies);
                if (result) {
                    const { value, offset, length, move } = result;
                    expression = expression.substring(0, offset) + value + expression.substring(offset + length);

                    this.replace(expression, this.getPosition() + move);
                }
            }

            return this;
        },

        /**
         * Checks if a variable is registered
         * @param {string} name
         * @returns {boolean}
         */
        hasVariable(name) {
            return variablesRegistry.has(name);
        },

        /**
         * Gets a variable defined for the expression.
         * @param {string} name - The variable name
         * @returns {mathsExpression} The value. Can be another expression.
         */
        getVariable(name) {
            return variablesRegistry.get(name);
        },

        /**
         * Gets the value of a variable.
         * @param {string} name - The variable name
         * @returns {string|number|Decimal} The computed value, or 0 if the variable does not exist.
         */
        getVariableValue(name) {
            const variable = variablesRegistry.get(name);
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

            variablesRegistry.set(name, value);

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
            variablesRegistry.delete(name);

            this.trigger('variabledelete', name);

            return this;
        },

        /**
         * Gets all variables in a list.
         * @returns {object} The list of defined variables.
         */
        getAllVariables() {
            const defs = {};
            variablesRegistry.forEach((value, name) => (defs[name] = value));
            return defs;
        },

        /**
         * Gets the values for the variables defined for the expression.
         * @returns {object} The list of variable values.
         */
        getAllVariableValues() {
            const defs = {};
            variablesRegistry.forEach((value, name) => (defs[name] = value.result));
            return defs;
        },

        /**
         * Sets a list of variables that can be used by the expression.
         * @param {object} defs - A list variables to set.
         * @returns {calculator}
         * @fires variableadd after each variable has been set
         */
        setVariableList(defs) {
            Object.keys(defs).forEach(name => this.setVariable(name, defs[name]));
            return this;
        },

        /**
         * Deletes all variables defined for the expression.
         * @returns {calculator}
         * @fires variableclear after the variables have been deleted
         */
        clearVariables() {
            variablesRegistry.clear();

            this.trigger('variableclear');

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
         * @returns {boolean}
         */
        hasCommand(name) {
            return commandsRegistry.has(name);
        },

        /**
         * Gets the action for a registered command
         * @param {string} name
         * @returns {function} The action for the registered command
         */
        getCommand(name) {
            return commandsRegistry.get(name);
        },

        /**
         * Registers a command
         * @param {string} name
         * @param {function} action
         * @returns {calculator}
         * @fires commandadd after the command has been set
         */
        setCommand(name, action) {
            commandsRegistry.set(name, action);

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
            commandsRegistry.delete(name);

            this.trigger('commanddelete', name);

            return this;
        },

        /**
         * Gets the list of registered commands
         * @returns {object} The list of registered commands
         */
        getAllCommands() {
            const defs = {};
            commandsRegistry.forEach((value, name) => (defs[name] = value));
            return defs;
        },

        /**
         * Registers a list of commands.
         * @param {object} defs - A list command to set.
         * @returns {calculator}
         * @fires commandadd after each command has been registered
         */
        setCommandList(defs) {
            Object.keys(defs).forEach(name => this.setCommand(name, defs[name]));
            return this;
        },

        /**
         * Deletes all commands from the calculator.
         * @returns {calculator}
         * @fires commandclear after the commands have been deleted
         */
        clearCommands() {
            commandsRegistry.clear();

            this.trigger('commandclear');

            return this;
        },

        /**
         * Checks if a plugin is installed.
         * @param {string} name
         * @returns {boolean}
         */
        hasPlugin(name) {
            return pluginsRegistry.has(name);
        },

        /**
         * Installs a plugin onto the calculator.
         * @param {string} name - The name of the plugin to install.
         * @param {pluginInstaller} install - The plugin installer. It should returns an uninstall callback.
         * @returns {calculator} - Chains the instance.
         * @fires pluginadd after the plugin has been installed
         * @fires plugindelete if a plugin has been uninstalled before
         */
        addPlugin(name, install) {
            if (this.hasPlugin(name)) {
                this.removePlugin(name);
            }

            const plugin = install(this) || true;

            pluginsRegistry.set(name, plugin);

            this.trigger('pluginadd', name);

            return this;
        },

        /**
         * Uninstalls a plugin from the calculator.
         * @param {string} name - The name of the plugin to uninstall.
         * @returns {calculator} - Chains the instance.
         * @fires plugindelete after the plugin has been uninstalled
         */
        removePlugin(name) {
            const uninstall = pluginsRegistry.get(name);

            if ('function' === typeof uninstall) {
                uninstall();
            }

            pluginsRegistry.delete(name);

            this.trigger('plugindelete', name);

            return this;
        },

        /**
         * Installs a list of plugins.
         * @param {object} defs - A list of plugins to install.
         * @returns {calculator}
         * @fires pluginadd after each plugin has been installed
         */
        addPluginList(defs) {
            Object.keys(defs).forEach(name => this.addPlugin(name, defs[name]));
            return this;
        },

        /**
         * Uninstalls all plugins.
         * @returns {calculator}
         * @fires pluginclear after the plugins have been uninstalled
         */
        clearPlugins() {
            pluginsRegistry.forEach(uninstall => {
                if ('function' === typeof uninstall) {
                    uninstall();
                }
            });
            pluginsRegistry.clear();

            this.trigger('pluginclear');

            return this;
        },

        /**
         * Inserts a term in the expression at the current position
         * @param {string} name - The name of the term to insert
         * @param {term} term - The definition of the term to insert
         * @returns {boolean} - Returns `true` once the term has been added. Returns `false` if the term cannot be added.
         * @fires error if the term to add is invalid
         * @fires expression after the expression has been changed
         * @fires position after the position has been changed
         * @fires replace after the expression has been replaced
         * @fires insert after the term has been inserted
         * @fires term when the term has been added
         */
        addTerm(name, term) {
            if ('object' !== typeof term || 'undefined' === typeof term.value) {
                this.trigger('error', new TypeError(`Invalid term: ${name}`));
                return false;
            }

            // when the instant computation mode is activated, we need to reset the expression
            // if it was explicitly evaluated and the new term is not a binary operator
            if (instant && !state.changed && !state.error && !tokensHelper.isBinaryOperator(term)) {
                this.replace(lastResultVariable);
            }

            let tokensList, newTokensList, currentToken, index;
            const getContext = () => {
                tokensList = this.getTokens();
                index = this.getTokenIndex();
                currentToken = tokensList[index];
                newTokensList = [...tokensList.slice(0, index + 1), term];
            };
            getContext();

            // prevent adding token that cannot be managed and that would break the expression
            if (applyContextStrategies(newTokensList, limitStrategies)) {
                return false;
            }

            // will replace the expression with the new term if:
            // - it is a 0, and the term to add is not an operator nor a dot
            // - it is the last result, and the term to add is not an operator
            if (applyContextStrategies(newTokensList, replaceExpressionStrategies)) {
                this.replace(term.value);
            } else {
                // will replace the terms at the current position with respect to a list of strategies
                // typically if:
                // - the last term is an operator and the term to add is an operator
                // - the operator is not unary (percent or factorial)
                const tokensToRemove = applyContextStrategies(newTokensList, replaceOperatorStrategies);
                if (tokensToRemove) {
                    this.deleteTokenRange(tokensList[index - tokensToRemove + 1], currentToken);
                    getContext();
                }

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

                // special case for the decimal separator starting a number
                if (name === 'DOT' && !tokensHelper.isDigit(previousToken)) {
                    value = `${terms.NUM0.value}${value}`;
                }

                // append the appropriate separator to the term to add
                if (expression) {
                    if (previousToken) {
                        value = applyValueStrategies(value, previousToken.type, name, prefixStrategies);
                    }
                    if (nextToken) {
                        value = applyValueStrategies(value, name, nextToken.type, suffixStrategies);
                    }
                }

                // trim extraneous spaces
                if (value.startsWith(' ') && expression.charAt(at - 1) === ' ') {
                    value = value.trimStart();
                }
                if (value.endsWith(' ') && expression.charAt(at) === ' ') {
                    value = value.trimEnd();
                }

                // when the instant computation mode is activated, we need to calculate the result of the
                // current expression when a new operator is entered and the expression can be calculated
                if (value.startsWith(terms.MUL.value)) {
                    // we need to replace the new term for the strategy in order to take care of the glue
                    newTokensList = [...tokensList.slice(0, index + 1), terms.MUL];
                }
                if (instant && applyContextStrategies(newTokensList, triggerStrategies)) {
                    if (state.changed) {
                        // the expression is calculated only if it was not already done explicitly
                        this.evaluate();
                    }
                    this.replace(lastResultVariable);
                }

                this.insert(value, at);
            }

            this.trigger('term', name, term);

            return true;
        },

        /**
         * Inserts a term in the expression at the current position
         * @param {string} name - The name of the term to insert
         * @returns {boolean} - Returns `true` once the term has been added. Returns `false` if the term cannot be added.
         * @fires error if the term to add is invalid
         * @fires expression after the expression has been changed
         * @fires position after the position has been changed
         * @fires replace after the expression has been replaced
         * @fires insert after the term has been inserted
         * @fires term when the term has been added
         */
        insertTerm(name) {
            const prefixed = isPrefixedTerm(name);
            if (prefixed) {
                name = name.substring(1);
            }

            let term = terms[name];

            if ('undefined' === typeof term) {
                this.trigger('error', new TypeError(`Invalid term: ${name}`));
                return false;
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
         * @returns {boolean} - Returns `true` once the terms have been added. Returns `false` if a term cannot be added.
         * @fires error if a term to add is invalid
         * @fires expression after the expression has been changed
         * @fires position after the position has been changed
         * @fires replace after the expression has been replaced
         * @fires insert after the term has been inserted
         * @fires term when a term has been added
         */
        insertTermList(names) {
            if ('string' === typeof names) {
                names = names.split(reSpace);
            }

            return names.every(name => this.insertTerm(name));
        },

        /**
         * Inserts a variable as a term in the expression at the current position
         * @param {string} name - The name of the variable to insert
         * @returns {boolean} - Returns `true` once the term has been added. Returns `false` if the term cannot be added.
         * @fires error if the term to add is invalid
         * @fires expression after the expression has been changed
         * @fires position after the position has been changed
         * @fires replace after the expression has been replaced
         * @fires insert after the term has been inserted
         * @fires term when the term has been added
         */
        insertVariable(name) {
            if (!variablesRegistry.has(name)) {
                this.trigger('error', new TypeError(`Invalid variable: ${name}`));
                return false;
            }

            const token = `VAR_${name.toUpperCase()}`;
            return this.addTerm(token, {
                label: name,
                value: name,
                type: 'variable',
                token
            });
        },

        /**
         * Calls a command
         * @param {string} name - The name of the called command
         * @param {...*} args - additional params for the command
         * @returns {boolean} - Returns `true` once the command has been invoked. Returns `false` if the command cannot be invoked.
         * @fires command with the name and the parameters of the command
         * @fires command-<name> with the parameters of the command
         * @fires error if the command is invalid
         */
        invoke(name, ...args) {
            const action = commandsRegistry.get(name);

            if ('function' !== typeof action) {
                this.trigger('error', new TypeError(`Invalid command: ${name}`));
                return false;
            }

            this.trigger(`command-${name}`, ...args);
            this.trigger('command', name, ...args);

            action.apply(this, args);

            return true;
        },

        /**
         * Replaces the expression and move the cursor at the end.
         * @param {string} newExpression - The new expression to set
         * @param {number|string} [newPosition=newExpression.length] - The new position to set
         * @returns {calculator}
         * @fires expression after the expression has been changed
         * @fires position after the position has been changed
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
         * @fires expression after the expression has been changed
         * @fires position after the position has been changed
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
         * @fires expression after the expression has been changed
         * @fires position after the position has been changed
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
         * @fires variableclear after the variables have been deleted
         * @fires expression after the expression has been changed
         * @fires position after the position has been changed
         * @fires clear after the expression has been cleared
         * @fires reset after the calculator has been reset
         */
        reset() {
            this.clearVariables();
            this.clear();

            this.trigger('reset');

            return this;
        },

        /**
         * Corrects the expression if needed.
         * @returns {calculator}
         * @fires expression after the expression has been changed
         * @fires position after the position has been changed
         * @fires replace after the expression has been replaced
         * @fires correct after the expression has been corrected
         */
        correct() {
            const tokensList = this.getTokens();
            const correctedTokens = applyListStrategies(tokensList, correctStrategies);
            const correctedExpression = expressionHelper.build(correctedTokens);

            if (correctedExpression !== expression) {
                this.replace(correctedExpression);

                this.trigger('correct');
            }

            return this;
        },

        /**
         * Evaluates the current expression
         * @returns {mathsExpression|null}
         * @fires evaluate when the expression has been evaluated
         * @fires result when the result is available
         * @fires syntaxerror when the expression contains an error
         */
        evaluate() {
            let result = null;
            state.changed = false;

            try {
                // single term expression must be a value
                const tokensList = this.getTokens();
                if (tokensList.length === 1 && !tokensHelper.isValue(tokensList[0])) {
                    throw new Error('Invalid expression');
                }

                if (expression.trim()) {
                    const vars = this.getAllVariableValues();
                    result = mathsEvaluator(expression, vars);
                } else {
                    result = mathsEvaluator('0');
                }

                state.error = expressionHelper.containsError(result);

                this.trigger('evaluate', result);

                if (!state.error) {
                    this.setLastResult(result);
                }

                this.trigger('result', result);
            } catch (e) {
                state.error = true;
                this.trigger('syntaxerror', e);
            }

            return result;
        },

        /**
         * Renders the current expression into a list of terms.
         * This list can then be applied to a template.
         * @param {number} decimals - The number of decimals to present after the dot in the last result variable.
         * @returns {renderTerm[]}
         * @fires render when the expression has been rendered
         */
        render(decimals = defaultDecimalDigits) {
            const formattedVariables = expressionHelper.roundAllVariables(this.getAllVariables(), decimals);
            const renderedTerms = expressionHelper.render(this.getTokens(), formattedVariables, tokenizer);

            this.trigger('render', renderedTerms);

            return renderedTerms;
        }
    };

    if (position === null) {
        position = expression.length;
    }

    calculatorApi
        .configureMathsEvaluator()
        .setLastResult('0')
        .setMemory()
        .setExpression(expression)
        .setPosition(position)
        .setCommand('clear', () => calculatorApi.clear())
        .setCommand('reset', () => calculatorApi.reset())
        .setCommand('execute', () => {
            if (corrector) {
                calculatorApi.correct();
            }
            calculatorApi.evaluate();
        })
        .setCommand('var', name => calculatorApi.insertVariable(name))
        .setCommand('term', name => calculatorApi.insertTermList(name))
        .setCommand('sign', () => calculatorApi.changeSign())
        .setCommand('degree', () => calculatorApi.setDegreeMode(true))
        .setCommand('radian', () => calculatorApi.setDegreeMode(false))
        .setCommand('remind', () => calculatorApi.insertVariable(memoryVariable))
        .setCommand('memorize', () => calculatorApi.setMemory())
        .setCommand('forget', () => calculatorApi.clearMemory())
        .setCommand('moveLeft', () => calculatorApi.movePositionLeft())
        .setCommand('moveRight', () => calculatorApi.movePositionRight())
        .setCommand('deleteLeft', () => calculatorApi.deleteTokenLeft())
        .setCommand('deleteRight', () => calculatorApi.deleteTokenRight())
        .setCommandList(commands)
        .setVariableList(variables)
        .addPluginList(plugins);

    return calculatorApi;
}

export default engineFactory;

/**
 * @callback pluginInstaller
 * @param {calculator} calculator - The reference to the host calculator the plugin is bound to
 * @returns {function} - Returns a uninstall callback
 */

/**
 * Notifies the maths evaluator has been configured.
 * @event configure
 * @param {object} config - Config for the maths evaluator (@see mathsEvaluator)
 */

/**
 * Notifies the expression has changed.
 * @event expression
 * @param {string} expression - The new expression.
 */

/**
 * Notifies the position inside the expression has changed.
 * @event position
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
 * Notifies all variables have been removed.
 * @event variableclear
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
 * Notifies all commands have been removed.
 * @event commandclear
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
 * @event term
 * @param {string} name - The name of the added term
 * @param {term} term - The descriptor of the added term
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
 * Notifies the expression has been corrected.
 * @event correct
 */

/**
 * Notifies the expression has been evaluated.
 * @event evaluate
 * @param {mathsExpression} result - The result of the expression.
 */

/**
 * Notifies the result is available.
 * @event result
 * @param {mathsExpression} result - The result of the expression.
 */

/**
 * Notifies the expression has been rendered into a list of terms.
 * @event render
 * @param {renderTerm[]} terms - The list of rendered terms.
 */

/**
 * Notifies the expression has a syntax error.
 * @event syntaxerror
 * @param {Error} err - The error object.
 */

/**
 * Notifies an error occurred.
 * @event error
 * @param {Error} err - The error object.
 */

/**
 * @typedef {import('./terms.js').term} term
 */

/**
 * @typedef {import('./tokenizer.js').token} token
 */

/**
 * @typedef {import('./mathsEvaluator.js').mathsExpression} mathsExpression
 */

/**
 * @typedef {import('./expression.js').renderTerm} renderTerm
 */
