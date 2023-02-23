# tao-calculator-fe

![TAO Logo](https://github.com/oat-sa/taohub-developer-guide/raw/master/resources/tao-logo.png)

A calculator's engine for TAO.

[![GPLv2 License](https://img.shields.io/badge/License-GPL%20v2-yellow.svg)](./LICENSE) -
![ci](https://github.com/oat-sa/tao-calculator-fe/actions/workflows/continuous-integration.yml/badge.svg)

<!-- vscode-markdown-toc -->

-   [Project structure](#Projectstructure)
-   [Installation](#Installation)
    -   [Requirements](#Requirements)
    -   [Setup](#Setup)
-   [Development](#Development)
    -   [Available commands](#Availablecommands)
-   [History](#History)
-   [License](#License)

<!-- vscode-markdown-toc-config
	numbering=false
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

## <a name='Projectstructure'></a>Project structure

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

## <a name='Installation'></a>Installation

### <a name='Requirements'></a>Requirements

-   [node.js version 14](https://nodejs.org/dist/latest-v14.x/)

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

## <a name='Development'></a>Development

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

### <a name='Availablecommands'></a>Available commands

-   `npm run dev`: run the sandbox
-   `npm run dev:build`: build the sandbox
-   `npm run dev:watch`: build the sandbox and watch for changes
-   `npm run dev:serve`: starts a local server for the sandbox
-   `npm run dev:open`: open the sandbox in a browser
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
