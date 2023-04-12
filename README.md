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

Terms can be added or removed separately:

```javascript
// add terms to the expression
calculator.insertTerm('NUM2'); // expression: "2"
calculator.insertTerm('SUB'); // expression: "2-"
calculator.insertTerm('NUM5'); // expression: "2-5"

// remove the last term
calculator.deleteTokenLeft();
```

The list of all terms can also be returned:

```javascript
const tokens = calculator.getTokens();
```

#### <a name='Commands'></a>Commands

A command is a named action that can be registered once and invoked several times.

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
