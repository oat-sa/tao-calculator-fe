# tao-calculator-fe

[![GPLv2 License](https://img.shields.io/badge/License-GPL%20v2-yellow.svg)](./LICENSE) -
![ci](https://github.com/oat-sa/tao-calculator-fe/actions/workflows/continuous-integration.yml/badge.svg)

![TAO Logo](https://github.com/oat-sa/taohub-developer-guide/raw/master/resources/tao-logo.png)

A calculator's engine for TAO.

<!-- vscode-markdown-toc -->

-   [Calculator's engine overview](#Calculatorsengineoverview)
    -   [Requirements](#Requirements)
    -   [Usage](#Usage)
    -   [Breakdown](#Breakdown)
        -   [Events](#Events)
        -   [Terms](#Terms)
        -   [Commands](#Commands)
        -   [Plugins](#Plugins)
-   [Project's structure](#Projectsstructure)
-   [Development](#Development)
    -   [Setup](#Setup)
    -   [Useful Commands](#UsefulCommands)
    -   [All commands](#Allcommands)
-   [History](#History)
-   [License](#License)

<!-- vscode-markdown-toc-config
	numbering=false
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

## <a name='Calculatorsengineoverview'></a>Calculator's engine overview

The calculator's engine relies on a [formal parser](https://github.com/oat-sa/expr-eval) for evaluating mathematical expressions. It respects the [mathematical order of operations](https://en.wikipedia.org/wiki/BODMAS). Mathematical precision is handled by an [arbitrary precision](https://en.wikipedia.org/wiki/Arbitrary-precision_arithmetic) library which avoid the well known [round-off issue](https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html).

### <a name='Requirements'></a>Requirements

-   [node.js version 14](https://nodejs.org/dist/latest-v14.x/)

### <a name='Usage'></a>Usage

Add the dependency by running

```sh
npm i @oat-sa/tao-calculator
```

Then import the engine:

```javascript
import { engineFactory } from '@oat-sa/tao-calculator';

const calculator = engineFactory({
    expression: '', // The current expression
    position: 0, // The current position in the expression
    instant: false, // Should the engine compute the expression as soon as an operation is complete?
    corrector: false, // Should the engine auto-correct incomplete expression?
    variables: {}, // A list of variables
    commands: {}, // A list of commands that can be invoked
    plugins: {}, // A list of plugins to load
    maths: {} // Additional config for the internal maths evaluator
});
```

### <a name='Breakdown'></a>Breakdown

The engines itself is represented by an object having the following API sections:

-   events management
-   configuration
-   expression management
-   tokenization
-   variables management
-   commands management
-   plugins management

The engine emits events for each noticeable operation applied to the calculator. In other words, each time a modification is applied, a related event is emitted.

The expression is managed internally through a list of extracted tokens. For easing the expression management, the numbers are tokenized digit by digit. This helps adding or removing elements up to a single digit or symbol.

The engine can be extended through two distinct mechanisms: commands and plugins.

It is also accompanied by a set of helpers for manipulating expression terms.

#### <a name='Events'></a>Events

The engine offers an API for registering and emitting events:

-   `.on(name, listener)`: Registers a listener to each named event. Multiple names can be given, separated by a space.
-   `.off(name, listener)`: Removes a listener from a named event. If the name is omitted, all events are unregistered. If the listener is given, the event is unristered for this listener only, otherwise, all listeners for this event are unregistered. Multiple names can be given, separated by a space.
-   `.trigger(name, ...args)`: Emits an event for the given name, calling all listeners in order with the arguments passed on.

The engine emits events each time a modification or an action apply to it.

| event            | parameters               | description                                                     |
| ---------------- | ------------------------ | --------------------------------------------------------------- |
| `configure`      | `config`                 | Notifies the maths evaluator has been configured.               |
| `expression`     | `expression`             | Notifies the expression has changed.                            |
| `position`       | `position`               | Notifies the position inside the expression has changed.        |
| `variableadd`    | `name`, `value`          | Notifies a variable has been added.                             |
| `variabledelete` | `name`                   | Notifies a variable has been removed.                           |
| `variableclear`  |                          | Notifies all variables have been removed.                       |
| `commandadd`     | `name`                   | Notifies a command has been registered.                         |
| `commanddelete`  | `name`                   | Notifies a command has been removed.                            |
| `commandclear`   |                          | Notifies all commands have been removed.                        |
| `command`        | `name`, ...              | Notifies a command has been invoked.                            |
| `command-<name>` | ...                      | Notifies the command `<name>` has been invoked.                 |
| `term`           | `name`, `term`           | Notifies a term has been added to the expression.               |
| `replace`        | `expression`, `position` | Notifies the expression has been replaced.                      |
| `insert`         | `expression`, `position` | Notifies a sub-expression has been inserted.                    |
| `clear`          |                          | Notifies the expression has been cleared.                       |
| `reset`          |                          | Notifies the calculator has been reset.                         |
| `correct`        |                          | Notifies the expression has been corrected.                     |
| `evaluate`       | `result`                 | Notifies the expression has been evaluated.                     |
| `result`         | `result`                 | Notifies the result is available.                               |
| `render`         | `terms`                  | Notifies the expression has been rendered into a list of terms. |
| `syntaxerror`    | `error`                  | Notifies the expression has a syntax error.                     |
| `error`          | `error`                  | Notifies an error occurred.                                     |

Example:

```javascript
// register events
calculator
    .on('expression', expression => console.log(`The expression has changed to "${expression}"`))
    .on('position', position => console.log(`The position has changed to ${position}`))
    .on('result', result => console.log(`${result.expression} = ${result.result}`))
    .on('syntaxerror', e => console.error(`Syntax error: ${e.message}`));

// set the expression and move the position to the end
calculator.replace('3*(4+2)'); // emit the events 'expression' and 'position'

// evaluate the expression
calculator.evaluate(); // emit the events 'evaluate' and 'result', and possibly `syntaxerror`
```

#### <a name='Terms'></a>Terms

The expression is managed internally through a list of terms. Each term can represent a digit, an operator, a function, or a variable.

| term       | value      | description                                              |
| ---------- | ---------- | -------------------------------------------------------- |
| `NUM0`     | `0`        | Digit 0                                                  |
| `NUM1`     | `1`        | Digit 1                                                  |
| `NUM2`     | `2`        | Digit 2                                                  |
| `NUM3`     | `3`        | Digit 3                                                  |
| `NUM4`     | `4`        | Digit 4                                                  |
| `NUM5`     | `5`        | Digit 5                                                  |
| `NUM6`     | `6`        | Digit 6                                                  |
| `NUM7`     | `7`        | Digit 7                                                  |
| `NUM8`     | `8`        | Digit 8                                                  |
| `NUM9`     | `9`        | Digit 9                                                  |
| `DOT`      | `.`        | Decimal separator                                        |
| `EXP10`    | `e`        | Decimal exponent for scientific numbers (ex: `1.234e34`) |
| `LPAR`     | `(`        | Left parenthesis                                         |
| `RPAR`     | `)`        | Right parenthesis                                        |
| `SUB`      | `-`        | Subtraction operator                                     |
| `ADD`      | `+`        | Addition operator                                        |
| `MUL`      | `*`        | Multiply operator                                        |
| `DIV`      | `/`        | Divide operator                                          |
| `MOD`      | `%`        | Modulo operator                                          |
| `POW`      | `^`        | Power operator                                           |
| `FAC`      | `!`        | Factorial operator                                       |
| `PERCENT`  | `#`        | Percentage operator                                      |
| `VAR_ANS`  | `ans`      | Last result variable                                     |
| `VAR_MEM`  | `mem`      | Memory variable                                          |
| `PI`       | `PI`       | Pi number                                                |
| `E`        | `E`        | Euler's constant                                         |
| `TEN`      | `10`       | Constant utilized for expressing the power of 10         |
| `NAN`      | `NaN`      | Error `Not a number`                                     |
| `INFINITY` | `Infinity` | Error `Infinity`                                         |
| `ERROR`    | `Syntax`   | Error `Syntax`                                           |
| `EXP`      | `exp`      | Function exponent                                        |
| `SQRT`     | `sqrt`     | Function square root                                     |
| `CBRT`     | `cbrt`     | Function cubic root                                      |
| `NTHRT`    | `nthrt`    | Function Nth root                                        |
| `FLOOR`    | `floor`    | Function round by the floor                              |
| `CEIL`     | `ceil`     | Function round by the ceil                               |
| `ROUND`    | `round`    | Function round by the average                            |
| `TRUNC`    | `trunc`    | Function truncate                                        |
| `SIN`      | `sin`      | Function sine                                            |
| `COS`      | `cos`      | Function cosine                                          |
| `TAN`      | `tan`      | Function tangent                                         |
| `ASIN`     | `asin`     | Function arc sine                                        |
| `ACOS`     | `acos`     | Function arc cosine                                      |
| `ATAN`     | `atan`     | Function arc tangent                                     |
| `SINH`     | `sinh`     | Function hyperbolic sine                                 |
| `COSH`     | `cosh`     | Function hyperbolic cosine                               |
| `TANH`     | `tanh`     | Function hyperbolic tangent                              |
| `ASINH`    | `asinh`    | Function hyperbolic arc sine                             |
| `ACOSH`    | `acosh`    | Function hyperbolic arc cosine                           |
| `ATANH`    | `atanh`    | Function hyperbolic arc tangent                          |
| `LN`       | `ln`       | Function natural logarithm                               |
| `LOG10`    | `ln`       | Function decimal logarithm                               |
| `ABS`      | `abs`      | Function absolute value                                  |
| `RAND`     | `random`   | Function random value                                    |

Terms can be added or removed separately:

```javascript
// add terms to the expression
calculator.insertTerm('NUM2'); // expression: "2"
calculator.insertTerm('SUB'); // expression: "2-"
calculator.insertTerm('NUM5'); // expression: "2-5"

// remove the last term
calculator.deleteTokenLeft();
```

The list of terms extracted from the expression can also be returned:

```javascript
const tokens = calculator.getTokens();
```

#### <a name='Commands'></a>Commands

A command is a named action that can be registered once and invoked several times.

The calculator comes with built-in commands.

| Command       | parameters | description                                                                       |
| ------------- | ---------- | --------------------------------------------------------------------------------- |
| `clear`       |            | Clears the expression.                                                            |
| `reset`       |            | Resets the calculator.                                                            |
| `execute`     |            | Evaluates the current expression.                                                 |
| `var`         | `name`     | Inserts a variable as a term in the expression at the current position.           |
| `term`        | `names`    | Inserts a list of terms in the expression at the current position.                |
| `sign`        |            | Changes the sign for the current token.                                           |
| `degree`      |            | Sets the engine to process the angles in degrees.                                 |
| `radian`      |            | Sets the engine to process the angles in radians.                                 |
| `remind`      |            | Inserts the `memory` variable as a term in the expression at the current position |
| `memorize`    |            | Records the current result into the `memory` variable.                            |
| `forget`      |            | Clears the `memory` variable.                                                     |
| `moveLeft`    |            | Moves the position by one term to the left.                                       |
| `moveRight`   |            | Moves the position by one term to the right.                                      |
| `deleteLeft`  |            | Removes the term on the left.                                                     |
| `deleteRight` |            | Removes the term on the right.                                                    |

Custom commands can be added too:

```javascript
// A simple command that prints the expression
function printExpression() {
    console.log('The expression is:', this.getExpression());
}

// Register the command with the name 'print'
calculator.setCommand('print', printExpression);

// Call the command
calculator.invoke('print');
```

#### <a name='Plugins'></a>Plugins

A plugin is a modification that can be added to or removed from the calculator. Usually, custom commands are added through a plugin.

The calculator comes with built-in plugins.

| Plugin    | Module          | description                                                                                                            |
| --------- | --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `history` | `historyPlugin` | Manages the history of the evaluated expressions. It adds the commands `historyClear`, `historyUp`, and `historyDown`. |

Plugins can be added upon creation of the calculator:

```javascript
import { engineFactory, historyPlugin } from '@oat-sa/tao-calculator';

const plugins = { history: historyPlugin };
const calculator = engineFactory({ plugins });
```

Custom plugins can be added too:

```javascript
// A simple plugin that add a print command
function pluginPrint(calculator) {
    calculator.setCommand('print', () => console.log('The expression is:', calculator.getExpression()));

    // returns a uninstall action
    return () => {
        calculator.deleteCommand('print');
    };
}

// Register the plugin with the name 'print'
calculator.addPlugin('print', pluginPrint);

// Call the command registered by the plugin
calculator.invoke('print');

// Remove the plugin
calculator.removePlugin('print');
```

## <a name='Projectsstructure'></a>Project's structure

```text
├── .github
│   └── workflows       # github action workflows
├── build               # standalone package generated
├── sandbox             # sandbox for playing with the engine locally
├── src                 # root of the source files
│   ├── core            # source files for the core engine
│   │   └── strategies  # a set of strategies for internal features
│   └── plugins         # a set of plugins that can be added on top of the engine
├── *.config.js         # shared tools configurations
├── LICENSE
├── package.json
├── package-lock.json
└── README.md
```

## <a name='Development'></a>Development

### <a name='Setup'></a>Setup

1. Clone the repository

```sh
git clone git@github.com:oat-sa/tao-calculator-fe.git
```

2. Install the package with `npm`:

```sh
cd tao-calculator-fe
npm ci
```

### <a name='UsefulCommands'></a>Useful Commands

To run the sandbox:

```sh
npm run dev
```

To run unit tests:

```sh
npm test
```

To update the test snapshots:

```sh
npm run test:update
```

To run unit tests while developing:

```sh
npm run test:watch
```

To run unit tests with coverage report:

```sh
npm run test:cov
```

### <a name='Allcommands'></a>All commands

-   `npm run dev`: run a sandbox and watch for changes. It also opens it in the browser
-   `npm run test`: run the test suite
-   `npm run test <testname>`: run a test suite
    -   `testname` (optional): Specific test to run. If it is not provided, all will be ran.
-   `npm run test:update`: run tests and update the snapshots
-   `npm run test:watch`: run tests after each change in the code
-   `npm run test:cov`: run tests and report the code coverage in the terminal
-   `npm run coverage:html`: show coverage report in browser
-   `npm run coverage:clover`: build a code coverage report for continuous integration
-   `npm run build`: build for production into `dist` directory
-   `npm run build:watch`: build for production into `dist` directory and watch for changes
-   `npm run lint`: check syntax of code
-   `npm run lint:report`: build a syntax check report
-   `npm run format`: correct the code style

## <a name='History'></a>History

This repository has been migrated on 2023/01/31 from:

-   https://github.com/oat-sa/tao-core-ui-fe/tree/f6849b81fdf0ca756cbf53a747e72d6ec0509936/src/maths/calculator
-   https://github.com/oat-sa/tao-core-sdk-fe/blob/f6c28d3b712098f17efc99712e3eeed87f804f6e/src/util/mathsEvaluator.js

Please consult those repositories for history prior to this date.

## <a name='License'></a>License

Copyright (c) 2018-2023 Open Assessment Technologies SA

Licensed under the terms of the [GNU GPL v2](./LICENSE)
