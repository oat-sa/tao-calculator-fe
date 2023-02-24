<script>
    // Licensed under Gnu Public License version 2
    // Copyright (c) 2023 (original work) Open Assessment Technologies SA ;

    import { engineFactory, expressionHelper, historyPlugin, terms, tokensHelper } from 'calculator';
    import MathExpression from './MathExpression.svelte';
    import keyboard from './keyboard.js';

    const plugins = { history: historyPlugin };
    const calculator = engineFactory({ plugins });
    const lastResultVariable = terms.ANS.value;
    const errorValue = terms.ERROR.value;

    let decimals = 5;
    let degree = false;
    let commandName = '';
    let commandParam = '';
    let expression = '';
    let expressionJSON = '';
    let resultJSON = '';
    let resultValue = '';
    let renderedTerms = [];
    let renderedResult = [];
    let renderedJSON = '';
    let variables = calculator.getAllVariableValues();
    let active = true;
    let error = false;

    function formatExpression(expr) {
        const allVariables = expressionHelper.roundAllVariables(calculator.getAllVariables(), decimals);
        return expressionHelper.render(expr, allVariables, calculator.getTokenizer());
    }

    function rawInput(e) {
        calculator.replace(e.target.value);
        active = true;
        error = false;
    }

    function rawInputKeyUp(e) {
        if (e.key === 'Enter') {
            calculator.evaluate();
        }
    }

    function commandKeyUp(e) {
        if (e.key === 'Enter') {
            invoke();
        }
    }

    function invoke() {
        if (commandName.trim() !== '') {
            calculator.invoke(commandName.trim(), commandParam.trim());
        }
    }

    function modeChange() {
        if (calculator.isDegreeMode() !== degree) {
            calculator.setDegreeMode(degree);
        }
    }

    function keyboardClick(e) {
        const button = e.target.closest('[data-command]');
        if (!button) {
            return;
        }

        const { command, param } = button.dataset;
        calculator.invoke(command, param);
    }

    calculator
        .on('configure', () => {
            degree = calculator.isDegreeMode();
        })
        .on('expression', expr => {
            expression = expr;
            renderedTerms = expressionHelper.nestExponents(calculator.render(decimals));
            renderedJSON = JSON.stringify(renderedTerms, null, 4);

            try {
                const parsedExpression = calculator.getMathsEvaluator().parser.parse(expression);
                expressionJSON = JSON.stringify(parsedExpression, null, 4);
            } catch (e) {
                expressionJSON = e.message;
            }
        })
        .on('result', result => {
            resultValue = result.result;
            resultJSON = JSON.stringify(result, null, 4);
            active = false;
            error = calculator.error;

            if (error) {
                renderedResult = formatExpression(result);
            } else {
                renderedResult = formatExpression(lastResultVariable);
            }
        })
        .on('command', (name, parameter) => {
            if (active || error) {
                return;
            }

            let expr = '';
            if (name === 'term') {
                const [token] = parameter.split(/\s+/);
                if (tokensHelper.isOperator(terms[token])) {
                    expr = lastResultVariable;
                }
            }

            calculator.replace(expr);
        })
        .on('command clear', () => {
            resultValue = '';
            renderedResult = [];
            active = true;
            error = false;
        })
        .on('clear', () => {
            resultJSON = '';
        })
        .on('variableadd', (name, value) => {
            variables[name] = value.result;
        })
        .on('syntaxerror', () => {
            resultValue = errorValue;
            active = false;
            error = true;
            renderedResult = formatExpression(resultValue);
        })
        // eslint-disable-next-line no-console
        .on('error', e => window.console.error(e));
</script>

<div class="sandbox">
    <div class="calculator">
        <div class="screen">
            <div class="expression" class:active>
                <MathExpression type="expression" value={expression} label={renderedTerms} />
            </div>
            <div class="result">
                {#if !active}
                    <MathExpression type="result" value={resultValue} label={renderedResult} />
                {/if}
            </div>
        </div>
        <div class="keyboard" on:click={keyboardClick} on:keyup>
            {#each keyboard as row, i (i)}
                <div class="row">
                    {#each row as { type, style, command, parameter, label, size, disabled }, j (j)}
                        {#if 'spacer' === type || disabled}
                            <span class="spacer size-{size}" />
                        {:else}
                            <button
                                type="button"
                                class="key {style} size-{size}"
                                data-command={command}
                                data-param={parameter}
                            >
                                {@html label}
                            </button>
                        {/if}
                    {/each}
                </div>
            {/each}
        </div>
    </div>
    <div class="context">
        <div class="control">
            <fieldset class="input">
                <legend>Input</legend>
                <div class="context-row raw">
                    <input
                        type="text"
                        placeholder="expression"
                        value={expression}
                        on:input={rawInput}
                        on:keyup={rawInputKeyUp}
                    />
                </div>
                <div class="context-row mode">
                    <label>
                        <input type="radio" name="angle" value={true} bind:group={degree} on:change={modeChange} />
                        <span>degree</span>
                    </label>
                    <label>
                        <input type="radio" name="angle" value={false} bind:group={degree} on:change={modeChange} />
                        <span>radian</span>
                    </label>
                </div>
            </fieldset>
            <fieldset class="command">
                <legend>Command</legend>
                <div class="context-row">
                    <input type="text" placeholder="command" bind:value={commandName} on:keyup={commandKeyUp} />
                    <input type="text" placeholder="parameter" bind:value={commandParam} on:keyup={commandKeyUp} />
                    <input type="button" value="Call" on:click={invoke} />
                </div>
            </fieldset>
        </div>
        <div class="state">
            <fieldset class="output">
                <legend>Result</legend>
                <pre>{resultJSON}</pre>
            </fieldset>
            <fieldset class="variables">
                <legend>Variables</legend>
                {#each Object.entries(variables) as [name, value]}
                    <div class="field">
                        <span>{name}:</span>
                        <code>{value}</code>
                    </div>
                {/each}
            </fieldset>
        </div>
        <div class="state">
            <fieldset class="parser">
                <legend>Parser</legend>
                <details>
                    <summary>JSON</summary>
                    <pre>{expressionJSON}</pre>
                </details>
            </fieldset>
        </div>
        <div class="state">
            <fieldset class="tokens">
                <legend>Tokens</legend>
                <details>
                    <summary>JSON</summary>
                    <pre>{renderedJSON}</pre>
                </details>
            </fieldset>
        </div>
    </div>
</div>

<style>
    :root {
        --calculator-size-unit: 3rem;
        --calculator-button-margin: 1px;

        --color-text-default: hsl(0, 0%, 12%);
        --color-text-secondary: hsl(0, 0%, 33%);
        --color-bg-default: hsl(0, 0%, 100%);
        --color-bg-button: hsl(0, 0%, 95%);
        --color-bg-button-dark: hsl(0, 0%, 82%);
        --color-bg-special: hsl(0, 0%, 90%);
        --color-bg-special-dark: hsl(0, 0%, 80%);
        --color-bg-primary: hsl(208, 100%, 53%);
        --color-bg-primary-dark: hsl(208, 100%, 42%);
        --color-bg-secondary: hsl(208, 100%, 95%);
        --color-bg-secondary-dark: hsl(208, 100%, 65%);
        --color-text-inverted: hsl(0, 0%, 100%);
        --color-bg-inverted: hsl(0, 0%, 12%);
        --color-separator: hsl(0, 0%, 12%);

        --screen-text: var(--color-text-inverted);
        --screen-background: var(--color-bg-inverted);

        --keyboard-command-text: var(--color-text-default);
        --keyboard-command-background: var(--color-bg-button);
        --keyboard-command-text-hover: var(--color-text-default);
        --keyboard-command-background-hover: var(--color-bg-button-dark);

        --keyboard-special-text: var(--color-text-default);
        --keyboard-special-background: var(--color-bg-special);
        --keyboard-special-text-hover: var(--color-text-default);
        --keyboard-special-background-hover: var(--color-bg-special-dark);

        --keyboard-operator-text: var(--color-text-inverted);
        --keyboard-operator-background: var(--color-bg-primary);
        --keyboard-operator-text-hover: var(--color-text-inverted);
        --keyboard-operator-background-hover: var(--color-bg-primary-dark);

        --keyboard-digit-text: var(--color-text-default);
        --keyboard-digit-background: var(--color-bg-secondary);
        --keyboard-digit-text-hover: var(--color-text-default);
        --keyboard-digit-background-hover: var(--color-bg-secondary-dark);
    }
    :global(html) {
        box-sizing: border-box;
        word-break: break-word;
        height: 100%;
        font-size: 50%;
    }
    @media screen and (min-width: 1921px) {
        :global(html) {
            font-size: 65%;
        }
    }
    @media screen and (min-width: 2561px) {
        :global(html) {
            font-size: 87.5%;
        }
    }
    @media screen and (min-width: 3841px) {
        :global(html) {
            font-size: 130%;
        }
    }
    :global(body) {
        font-family: 'Nunito Sans', 'Source Sans Pro', Arial, sans-serif;
        font-size: 2rem;
        line-height: 1.5;
        color: var(--color-text-default);
        height: 100%;
        padding: 0;
        margin: 0;
    }
    :global(pre, code, kbd) {
        font-family: Consolas, 'Andale Mono', 'Lucida Console', Monaco, 'Courier New', Courier, monospace;
        font-size: 1.5rem;
        white-space: pre;
        margin: 0;
        padding: 0;
    }
    .sandbox {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        align-content: stretch;
        height: 100%;
    }
    .context {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        align-content: stretch;
        padding: 1rem;
        flex: 1 1 auto;
        overflow: auto;
    }
    .context-row {
        padding: 4px 0;
    }
    .raw input {
        width: 100%;
    }
    .state {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        align-content: stretch;
        font-size: smaller;
    }
    fieldset {
        flex: 1 1 auto;
        border: 1px dashed var(--color-separator);
        margin: 1rem;
    }
    legend {
        font-size: 1.6rem;
        color: var(--color-text-secondary);
    }
    label {
        font-size: smaller;
    }
    .field {
        padding: 0.25rem 0;
    }
    .field span {
        font-weight: bold;
    }
    .field code {
        white-space: pre;
    }
    .calculator {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        align-content: stretch;
        border-right: 2px solid var(--color-separator);
        min-width: 40%;
    }
    .screen {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-end;
        gap: 0.4rem;
        flex: 0 0 auto;
        min-width: calc(12 * var(--calculator-size-unit));
        color: var(--screen-text);
        background-color: var(--screen-background);
    }
    .expression {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        text-align: right;
        font-weight: 400;
        font-size: 1.6rem;
        line-height: 2.1rem;
        min-height: 4.2rem;
        width: 100%;
        padding: 0 1rem;
    }
    .expression:not(.active) {
        opacity: 0.5;
    }
    .result {
        text-align: right;
        font-weight: 700;
        font-size: 2.4rem;
        min-height: 5rem;
        width: 100%;
        padding: 0 1rem;
    }
    .keyboard {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        align-content: stretch;
        flex: 1 1 auto;
    }
    .row {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        align-content: stretch;
        flex: 1 1 auto;
    }
    .key,
    .spacer {
        margin: var(--calculator-button-margin);
        min-height: var(--calculator-size-unit);
        font-size: calc(var(--calculator-size-unit) / 2);
        display: inline-block;
        border: 0 none;
    }
    .key {
        cursor: pointer;
        color: var(--keyboard-command-text);
        background-color: var(--keyboard-command-background);
    }
    .key:hover {
        color: var(--keyboard-command-text-hover);
        background-color: var(--keyboard-command-background-hover);
    }
    .function {
        font-size: smaller;
    }
    .command {
        font-weight: bold;
        color: var(--keyboard-special-text);
        background-color: var(--keyboard-special-background);
    }
    .operator {
        color: var(--keyboard-operator-text);
        background-color: var(--keyboard-operator-background);
        font-size: larger;
    }
    .operator:hover {
        color: var(--keyboard-operator-text-hover);
        background-color: var(--keyboard-operator-background-hover);
    }
    .digit {
        color: var(--keyboard-digit-text);
        background-color: var(--keyboard-digit-background);
        font-weight: bold;
        font-size: larger;
    }
    .digit:hover {
        color: var(--keyboard-digit-text-hover);
        background-color: var(--keyboard-digit-background-hover);
    }
    .size-2 {
        min-width: calc(2 * var(--calculator-size-unit) - 2 * var(--calculator-button-margin));
        flex: 1 0 calc(100% / 6 - 2 * var(--calculator-button-margin));
    }
    .size-3 {
        min-width: calc(3 * var(--calculator-size-unit) - 2 * var(--calculator-button-margin));
        flex: 1 0 calc(100% / 4 - 2 * var(--calculator-button-margin));
    }
    .size-6 {
        min-width: calc(6 * var(--calculator-size-unit) - 2 * var(--calculator-button-margin));
        flex: 1 0 calc(100% / 2 - 2 * var(--calculator-button-margin));
    }
    .size-8 {
        min-width: calc(8 * var(--calculator-size-unit) - 2 * var(--calculator-button-margin));
        flex: 1 0 calc(100% / 3 * 2 - 2 * var(--calculator-button-margin));
    }
    .size-12 {
        min-width: calc(12 * var(--calculator-size-unit) - 2 * var(--calculator-button-margin));
        flex: 1 0 calc(100% - 2 * var(--calculator-button-margin));
    }
</style>
