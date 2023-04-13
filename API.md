# [tao-calculator's](./README.md) API

A calculator's engine for TAO.

<!-- vscode-markdown-toc -->

-   [Configuration](#Configuration)
-   [Events](#Events)
-   [Expression](#Expression)
-   [Terms](#Terms)
-   [Variables](#Variables)
-   [Commands](#Commands)
-   [Plugins](#Plugins)
-   [Helpers](#Helpers)
    -   [expressionHelper](#expressionHelper)
    -   [tokensHelper](#tokensHelper)
    -   [terms](#terms)
    -   [mathsEvaluatorFactory](#mathsEvaluatorFactory)
    -   [tokenizerFactory](#tokenizerFactory)

<!-- vscode-markdown-toc-config
	numbering=false
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

## <a name='Configuration'></a>Configuration

The engine can be configured upon creation through the config object.

```javascript
const calculator = engineFactory({ ... });
```

| name         | type       | default | description                                                                                                    |
| ------------ | ---------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| `expression` | `string`   | `''`    | Set the initial value for the expression.                                                                      |
| `position`   | `position` | `null`  | Set the position inside the initial expression. If omitted, the position is set to the expression's end.       |
| `instant`    | `boolean`  | `false` | Should the engine compute the expression as soon as an operation is complete?                                  |
| `correct`    | `boolean`  | `false` | Should the engine auto-correct incomplete expression?                                                          |
| `variables`  | `object`   | `{}`    | A list of variables to define, as key/value.                                                                   |
| `commands`   | `object`   | `{}`    | A list of commands that can be invoked, as key/action.                                                         |
| `plugins`    | `object`   | `{}`    | A list of plugins to load, as key/install.                                                                     |
| `maths`      | `object`   | `{}`    | Additional config for the internal maths evaluator. See `configureMathsEvaluator()` below for additional info. |

Once the calculator engine is created, it can be configured using the following API:

-   `.configureMathsEvaluator(config = {})`: Sets up the mathsEvaluator. The supplied configuration will be merged with the maths configuration given at creation time. The accepted configuration is as follows:

    | name                | type      | default | description                                                                                              |
    | ------------------- | --------- | ------- | -------------------------------------------------------------------------------------------------------- |
    | `precision`         | `number`  | `20`    | The maximum number of significant digits of the result of an operation.                                  |
    | `internalPrecision` | `number`  | `100`   | Arbitrary decimal precision for some internal related computations (sin, cos, tan, ln).                  |
    | `rounding`          | `number`  | `4`     | The default rounding mode used when rounding the result of an operation to precision significant digits. |
    | `toExpNeg`          | `number`  | `-7`    | The negative exponent value at and below which toString returns exponential notation.                    |
    | `toExpPos`          | `number`  | `21`    | The positive exponent value at and above which toString returns exponential notation.                    |
    | `maxE`              | `number`  | `9e15`  | The positive exponent limit, i.e. the exponent value above which overflow to Infinity occurs.            |
    | ` minE`             | `number ` | `-9e15` | - The negative exponent limit, i.e. the exponent value below which underflow to zero occurs.             |
    | `modulo`            | `number`  | `1`     | The modulo mode used when calculating the modulus: a mod n.                                              |
    | `crypto`            | `boolean` | `false` | The value that determines whether cryptographically-secure pseudo-random number generation is used.      |
    | `degree`            | `boolean` | `false` | Converts trigonometric values from radians to degrees.                                                   |
    | `operators`         | `object`  | `{}`    | The list of operators to enable.                                                                         |

-   `.setDegreeMode(degree = true)`: Sets the engine to process the angles in degree (`true`) or in radian ('false').
-   `.isDegreeMode()`:Tells if the engine process the angles in degree (`true`) or in radian ('false').
-   `.setInstantMode(mode = true)`: Sets the engine to compute the expression instantaneously (`true`) or not ('false').
-   `.isInstantMode()`:Tells if the engine must compute the expression instantaneously (`true`) or not ('false').
-   `.setCorrectorMode(mode = true)`: Sets the engine to correct the expression before evaluating it (`true`) or not ('false').
-   `.isCorrectorMode()`: Tells if the engine must correct the expression before evaluating it (`true`) or not ('false').
-   `.getMathsEvaluator()`: Gets access to the mathsEvaluator.
-   `.getTokenizer()`: Gets access to the tokenizer.
-   `.reset()`: Resets the calculator.

## <a name='Events'></a>Events

The engine emits events each time a modification or an action apply to the calculator.

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

The engine offers an API for registering and emitting events:

-   `.on(name, listener)`: Registers a listener to each named event. Multiple names can be given, separated by a space.
-   `.off(name, listener)`: Removes a listener from a named event. If the name is omitted, all events are unregistered. If the listener is given, the event is unristered for this listener only, otherwise, all listeners for this event are unregistered. Multiple names can be given, separated by a space.
-   `.trigger(name, ...args)`: Emits an event for the given name, calling all listeners in order with the arguments passed on.

## <a name='Expression'></a>Expression

The expression is managed internally through a list of extracted tokens. For easing the expression management, the numbers are tokenized digit by digit. This helps adding or removing elements up to a single digit or symbol.

The engines offers API for managing the expression:

-   `.changed`: Tells if the expression has changed since the last calculation.
-   `.error`: Tells if the expression has or produces error.
-   `.getExpression()`: Gets the current expression.
-   `.setExpression(expression)`: Sets the current expression.
-   `.getPosition()`: Gets the current position inside the expression
-   `.setPosition(position)`: Sets the current position inside the expression
-   `.movePositionLeft()`: Moves the current position to the token on the left.
-   `.movePositionRight()`: Moves the current position to the token on the right.
-   `.replace(newExpression, newPosition)`: Replaces the expression and move the cursor.
-   `.insert(subExpression, at)`:Inserts a sub-expression in the current expression and move the cursor.
-   `.clear()`: Clears the expression.
-   `.correct()`: Corrects the expression if needed.
-   `.evaluate()`: Evaluates the current expression.
-   `.render(decimals = 5)`: Renders the current expression into a list of terms. This list can then be applied to a template.

## <a name='Terms'></a>Terms

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

The engines offers API for managing the terms in the expression:

-   `.getTokens()`: Gets the list of tokens from the current expression.
-   `.getToken()`: Gets the token at the current position from the current expression.
-   `.getTokenIndex()`: Gets token index from the current position in the expression.
-   `.deleteToken(token)`: Removes the given token from the expression.
-   `.deleteTokenRange(start, end)`: Removes tokens from the expression with respect to range given the start and end tokens.
-   `.deleteTokenLeft()`: Deletes the token on the left
-   `.deleteTokenRight()`: Deletes the token on the right
-   `.changeSign()`: Changes the sign for the current token.
-   `.addTerm(name, term)`: Inserts the defined term in the expression at the current position.
-   `.insertTerm(name)`: Inserts a term by its name in the expression at the current position.
-   `.insertTermList(names)`: Inserts a list of terms in the expression at the current position.
-   `.insertVariable(name)`: Inserts a variable as a term in the expression at the current position.

## <a name='Variables'></a>Variables

The engines has a few built-in variables that are set in particular circumstances.

| Variable | Updated by                                             | Description                                                      |
| -------- | ------------------------------------------------------ | ---------------------------------------------------------------- |
| `ans`    | `evaluate`, `setLastResult`, `clearVariables`, `reset` | Contains the result of the last evaluated expression.            |
| `mem`    | `setMemory`, `clearMemory`, `clearVariables`,`reset`   | Contains the result that was specifically memorized by the user. |

The engines offers API for managing the variables:

-   `.hasVariable(name)`: Checks if a variable is registered.
-   `.getVariable(name)`: Gets a variable defined for the expression.
-   `.getVariableValue(name)`: Gets the value of a variable.
-   `.setVariable(name, value)`: Sets a variable that can be used by the expression.
-   `.deleteVariable(name)`: Deletes a variable defined for the expression.
-   `.getAllVariables()`: Gets all variables in a list.
-   `.getAllVariableValues()`: Gets the values for the variables defined for the expression.
-   `.setVariableList(defs)`: Sets a list of variables that can be used by the expression.
-   `.clearVariables()`: Deletes all variables defined for the expression.
-   `.setLastResult(result)`: Sets the value of the last result.
-   `.getLastResult()`: Gets the value of the last result.
-   `.setMemory()`: Sets the value of the last result into the memory.
-   `.getMemory()`: Gets the value of the memory.
-   `.clearMemory()`: Clears the value of the memory.
-   `.insertVariable(name)`: Inserts a variable as a term in the expression at the current position.

## <a name='Commands'></a>Commands

The engine can be extended through two distinct mechanisms: [Commands](#Commands) and [Plugins](#Plugins).

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

The engines offers API for managing the commands:

-   `.hasCommand(name)`: Checks if a command is registered.
-   `.getCommand(name)`: Gets the action for a registered command.
-   `.setCommand(name, action)`: Registers a command.
-   `.deleteCommand(name)`: Delete a registered command.
-   `.getAllCommands()`: Gets the list of registered commands.
-   `.setCommandList(defs)`: Registers a list of commands.
-   `.clearCommands()`: Deletes all commands from the calculator.
-   `.invoke(name, ...args)`: Calls a command.

## <a name='Plugins'></a>Plugins

The engine can be extended through two distinct mechanisms: [Commands](#Commands) and [Plugins](#Plugins).

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

The engines offers API for managing the plugins:

-   `.hasPlugin(name)`: Checks if a plugin is installed.
-   `.setPlugin(name, install)`: Installs a plugin onto the calculator.
-   `.removePlugin(name)`: Uninstalls a plugin from the calculator.
-   `.addPluginList(defs)`: Installs a list of plugins.
-   `.clearPlugins()`: Uninstalls all plugins.

## <a name='Helpers'></a>Helpers

A set of helpers and tools are offered aside the engine for manipulating expression terms

-   `expressionHelper`: A set of helpers for handling the expressions.
-   `tokensHelper`: A set of helpers for qualifying the expression tokens.
-   `terms`: The list of terms an expression can contain.
-   `mathsEvaluatorFactory`: The actual maths evaluator.
-   `tokenizerFactory`: The lexer used to tokenize the expression.

### <a name='expressionHelper'></a>expressionHelper

A set of helpers for handling the expressions.

```javascript
import { expressionHelper, defaultDecimalDigits } from '@oat-sa/tao-calculator';
```

-   `defaultDecimalDigits`: The default number of significant digits used to round displayed variables.
-   `expressionHelper.containsError(expression)`: Checks if an expression contains an error token.
-   `expressionHelper.replaceLastResult(expression, value)`: Replace the last result variable by a particular value in an expression.
-   `expressionHelper.roundVariable(variable, decimalDigits = 5)`: Rounds the value of a variable.
-   `expressionHelper.roundAllVariables(variables, decimalDigits)`: Rounds the value of the last result variable.
-   `expressionHelper.build(tokens)`: Builds an expression from a list of tokens.
-   `expressionHelper.renderSign(expression)`: Replace sign operators by a proper symbol.
-   `expressionHelper.render(expression, variables = {}, tokenizer = null)`: Renders an expression into a list of terms. This list can then be applied to a template.
-   `expressionHelper. nestExponents(renderedTerms)`: Nests the exponents so that the terms can be easily rendered. Remove the terms that can be elided, like the exponent operator.

### <a name='tokensHelper'></a>tokensHelper

A set of helpers for qualifying the expression tokens.

```javascript
import { expressionHelper } from '@oat-sa/tao-calculator';
```

-   `tokensHelper.getToken(token)`: Gets the token name.
-   `tokensHelper.getTerm(token)`: Gets the term defined for a token.
-   `tokensHelper.getType(token)`: Identifies the type of a given token.
-   `tokensHelper. isDigit(type)`: Checks if the type is related to a digit value.
-   `tokensHelper.isOperator(type)`: Checks if the type is related to an operator.
-   `tokensHelper.isBinaryOperator(type)`: Checks if the type is related to a binary operator
-   `tokensHelper.isUnaryOperator(type)`: Checks if the type is related to a unary operator
-   `tokensHelper.isOperand(type)`: Checks if the type is related to an operand.
-   `tokensHelper. isValue(type)`: Checks if the type is related to an operand.
-   `tokensHelper.isAggregator(type)`: Checks if the type is related to an aggregator.
-   `tokensHelper.isError(type)`: Checks if the type is related to an error.
-   `tokensHelper.isConstant(type)`: Checks if the type is related to a constant.
-   `tokensHelper.isVariable(type)`: Checks if the type is related to a variable.
-   `tokensHelper.isFunction(type)`: Checks if the type is related to a function.
-   `tokensHelper.isIdentifier(type)`: Checks if the type is related to an identifier.
-   `tokensHelper.isSeparator(type)`: Checks if the type is related to a separator.
-   `tokensHelper.isModifier(type)`: Checks if the type is related to a modifier.
-   `tokensHelper.isExponent(type)`: Checks if the type is related to an exponent.
-   `tokensHelper.stringValue(expression)`: Ensures an expression is a string. If a token or a descriptor is provided, extract the value.

### <a name='terms'></a>terms

The list of terms an expression can contain. It also expose helpers for formatting the labels.

```javascript
import {
    exponent,
    exponentLeft,
    exponentRight,
    functionOperators,
    isFunctionOperator,
    isPrefixedTerm,
    isSignOperator,
    signOperators,
    subscript,
    subscriptRight,
    symbols,
    terms,
    types
} from '@oat-sa/tao-calculator';
```

-   `exponent(x)`: Formats a math element as exponent.
-   `exponentLeft(a, x)`: Formats a math element with a value as exponent on the left side.
-   `exponentRight(a, x)`: Formats a math element with a value as exponent on the right side.
-   `functionOperators`: The list of tokens representing functions that can be considered binary operators.
-   `isFunctionOperator(token)`: Checks if a token is a function that can be used as an operator.
-   `isPrefixedTerm(name)`: Tells if a term is prefixed for turning a function into a binary operator.
-   `isSignOperator(token)`: Checks if a token is a sign operator.
-   `signOperators`: The list of tokens representing sign or sum.
-   `subscript(x)`: Formats a math element as index.
-   `subscriptRight(a, x)`: Formats a math element with a value as index on the right side.
-   `symbols`: The symbols for some maths elements.
-   `terms`: The list of terms that can be tokenized from an expression.
-   `types`: The types of tokens that can be represented in an expression.

### <a name='mathsEvaluatorFactory'></a>mathsEvaluatorFactory

The actual maths evaluator.

It is usually get from the calculator:

```javascript
const mathsEvaluator = calculator.getMathsEvaluator();
```

It can also be built on purpose:

```javascript
import { mathsEvaluatorFactory } from '@oat-sa/tao-calculator';

const mathsEvaluator = mathsEvaluatorFactory({ ... })
```

The configuration is an object with these properties:
| name | type | default | description |
| ------------------- | --------- | ------- | -------------------------------------------------------------------------------------------------------- |
| `precision` | `number` | `20` | The maximum number of significant digits of the result of an operation. |
| `internalPrecision` | `number` | `100` | Arbitrary decimal precision for some internal related computations (sin, cos, tan, ln). |
| `rounding` | `number` | `4` | The default rounding mode used when rounding the result of an operation to precision significant digits. |
| `toExpNeg` | `number` | `-7` | The negative exponent value at and below which toString returns exponential notation. |
| `toExpPos` | `number` | `21` | The positive exponent value at and above which toString returns exponential notation. |
| `maxE` | `number` | `9e15` | The positive exponent limit, i.e. the exponent value above which overflow to Infinity occurs. |
| ` minE` | `number ` | `-9e15` | - The negative exponent limit, i.e. the exponent value below which underflow to zero occurs. |
| `modulo` | `number` | `1` | The modulo mode used when calculating the modulus: a mod n. |
| `crypto` | `boolean` | `false` | The value that determines whether cryptographically-secure pseudo-random number generation is used. |
| `degree` | `boolean` | `false` | Converts trigonometric values from radians to degrees. |
| `operators` | `object` | `{}` | The list of operators to enable. |

### <a name='tokenizerFactory'></a>tokenizerFactory

The lexer used to tokenize the expression.

The tokenizer has 2 methods:

-   `.iterator(expression)`: Gets an iterator that will returns tokens from the provided expression.
-   `.tokenize(expression)`: Tokenizes the expression.

It is usually get from the calculator:

```javascript
const tokenizer = calculator.getTokenizer();
```

It can also be built on purpose:

```javascript
import { tokenizerFactory } from '@oat-sa/tao-calculator';

const tokenizer = tokenizerFactory({ ... });
```

The configuration is an object with these properties:
| name | type | description |
| ---------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| `keywords` | `object` | List of additional keywords: key being the name, value being the pattern (should be on the domain /[a-zA-Z]+/) |
| `symbols` | `object` | List of additional symbols: key being the name, value being the pattern |
| `digits` | `object` | List of additional digits: key being the name, value being the pattern |
