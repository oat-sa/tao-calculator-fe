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

/**
 * Installs history features to the calculator.
 * @param {calculator} calculator - The host calculator on which install the features.
 * @returns {function} - Returns the uninstall callback
 */
export default function historyPlugin(calculator) {
    let history, cursor, current;

    /**
     * Creates an entry from the current state
     * @returns {historyEntry}
     */
    function getCurrentState() {
        return {
            expression: calculator.getExpression(),
            variables: calculator.getAllVariables(),
            current: null
        };
    }

    /**
     * Clears the entire history
     */
    function reset() {
        current = getCurrentState();
        history = [];
        cursor = 0;
    }

    /**
     * Retrieves a memory entry in the history
     * @param {number} position
     * @returns {object|null}
     */
    function getMemoryAt(position) {
        if (position >= 0 && position < history.length) {
            return history[position];
        } else if (position === history.length) {
            return current;
        }

        return null;
    }

    /**
     * Reminds an expression from the history
     * @param {number} position
     */
    function remind(position) {
        // keep the current expression in the memory, in case the user goes back to it
        if (cursor === history.length && position !== cursor) {
            current = getCurrentState();
        } else {
            history[cursor].current = calculator.getExpression();
        }

        // restore an expression from the history at the wanted position
        const memory = getMemoryAt(position);
        if (memory) {
            cursor = position;

            if (memory.variables) {
                calculator.setVariableList(memory.variables);
            }

            calculator.replace(memory.current || memory.expression);
            memory.current = null;
        }
    }

    /**
     * Adds a memory entry in the history from the current expression
     */
    function push() {
        const last = getMemoryAt(history.length - 1);
        const memory = getMemoryAt(cursor);

        if (!last || calculator.getExpression() !== last.expression) {
            history.push(getCurrentState());
        }

        if (memory) {
            memory.current = null;
        }

        cursor = history.length;
    }

    /**
     * Uninstalls the plugin
     */
    function uninstall() {
        calculator
            .deleteCommand('historyClear')
            .deleteCommand('historyUp')
            .deleteCommand('historyDown')
            .off('evaluate', push)
            .off('reset', reset);
    }

    calculator
        .setCommand('historyClear', reset)
        .setCommand('historyUp', () => remind(cursor - 1))
        .setCommand('historyDown', () => remind(cursor + 1))
        .on('evaluate', push)
        .on('reset', reset);

    reset();
    return uninstall;
}

/**
 * Defines an entry in the history
 * @typedef {object} historyEntry
 * @property {string} expression - The expression that has been extracted when the entry was created
 * @property {object} variables - The list of variables that has been extracted when the entry was created
 * @property {string} [current] - The current edited expression if the entry is modified
 */
