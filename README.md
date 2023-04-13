# [tao-calculator](https://www.npmjs.com/package/@oat-sa/tao-calculator)

[![GPLv2 License](https://img.shields.io/badge/License-GPL%20v2-yellow.svg)](./LICENSE)
![ci](https://github.com/oat-sa/tao-calculator-fe/actions/workflows/continuous-integration.yml/badge.svg)

![TAO Logo](https://github.com/oat-sa/taohub-developer-guide/raw/master/resources/tao-logo.png)

A calculator's engine for TAO.

<!-- vscode-markdown-toc -->

-   [Calculator's engine overview](#Calculatorsengineoverview)
    -   [Requirements](#Requirements)
    -   [Usage](#Usage)
    -   [API](#API)
-   [Project's structure](#Projectsstructure)
-   [Development](#Development)
    -   [Setup](#Setup)
    -   [Useful Commands](#UsefulCommands)
    -   [All commands](#Allcommands)
-   [Known issues and drawbacks](#Knownissuesanddrawbacks)
    -   [Loss of precision of inlined variables](#Lossofprecisionofinlinedvariables)
    -   [Loss of precision in some irrational numbers](#Lossofprecisioninsomeirrationalnumbers)
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

-   [node.js version 14](https://nodejs.org/dist/latest-v14.x/) and above

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

See the [Configuration](./API.md#Configuration) section for more info.

### <a name='API'></a>API

The API is described in [the dedicated page](./API.md).

The engine emits events for each noticeable operation applied to the calculator. In other words, each time a modification is applied, a related event is emitted.

The expression is managed internally through a list of extracted tokens. For easing the expression management, the numbers are tokenized digit by digit. This helps adding or removing elements up to a single digit or symbol.

The engine can be extended through two distinct mechanisms: commands and plugins.

It is also accompanied by a set of helpers for manipulating expression terms.

## <a name='Projectsstructure'></a>Project's structure

```text
├── .github
│   └── workflows       # github action workflows
├── build               # standalone package generated
├── dist                # bundle generated from the source code
├── sandbox             # sandbox for playing with the engine locally
├── src                 # root of the source files
│   ├── core            # source files for the core engine
│   │   └── strategies  # a set of strategies for internal features
│   ├── plugins         # a set of plugins that can be added on top of the engine
│   ├── utils           # a set of utilities
│   └── index.js        # the engine entry point
├── *.config.js         # shared tools configurations
├── API.md
├── HISTORY.md
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

## <a name='Knownissuesanddrawbacks'></a>Known issues and drawbacks

Thanks to the numbers representation engine, the calculator is able to give a good computation precision. However, due to the nature of computation, some known issues are still there, and cannot be simply addressed.

### <a name='Lossofprecisionofinlinedvariables'></a>Loss of precision of inlined variables

Internally, the computed value have hundreds of decimal digits, and only a few is displayed. So, if a variable is inlined, i.e. its displayed value is used instead of the variable itself, the result won't be accurate. For instance, compute the square root of 2. If you immediately elevate it at a power of 2, you will retrieve the former value, said 2. However, if you take the displayed value and elevate it to the power of 2, the result will be different, and could be considered wrong if you expected to retrieve the former value.

### <a name='Lossofprecisioninsomeirrationalnumbers'></a>Loss of precision in some irrational numbers

Mathematically, it is impossible to have a bijective computation with the inverse of 3: `1/3` gives `0.3333333333333`, and we can continue indefinitely with the `3` after the decimal point. Now if you multiply this value by 3, no matter the amount of `3` you will add after the decimal point, you will never retrieve `1`, but `0.9999999999` instead. A mathematical trick is to add a `4` as a last digit, but unfortunately this won't work with the calculator's engine. In fact, it can only work by doing: `0.333333333 + 0.333333333 + 0.333333334`. Which is not the same.

## <a name='History'></a>History

Changes are detailed in the [history page](./HISTORY.md).

This repository has been migrated on 2023/01/31 from:

-   [oat-sa/tao-core-ui-fe](https://github.com/oat-sa/tao-core-ui-fe/tree/f6849b81fdf0ca756cbf53a747e72d6ec0509936/src/maths/calculator)
-   [oat-sa/tao-core-sdk-fe](https://github.com/oat-sa/tao-core-sdk-fe/blob/f6c28d3b712098f17efc99712e3eeed87f804f6e/src/util/mathsEvaluator.js)

Please consult those repositories for history prior to this date.

## <a name='License'></a>License

Copyright (c) 2018-2023 Open Assessment Technologies SA

Licensed under the terms of the [GNU GPL v2](./LICENSE)
