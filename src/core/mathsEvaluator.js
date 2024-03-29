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
 * Copyright (c) 2018-2023 (original work) Open Assessment Technologies SA ;
 */

import Decimal from 'decimal.js';
import exprEval from '@oat-sa/expr-eval';

const { Parser } = exprEval;

/**
 * Good precision value of PI
 * @type {string}
 */
const numberPI =
    '3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989';

/**
 * Good precision value of Euler's number
 * @type {string}
 */
const numberE =
    '2.7182818284590452353602874713526624977572470936999595749669676277240766303535475945713821785251664274274663919320030599218174135966290435729003342952605956307381323286279434907632338298807531952510190115738341879307021540891499348841675092447614606680822648001684774118537423454424371075390777449920695517027618386062613313845830007520449338265602976067371132007093287091274437470472306969772093101416928368190255151086574637721112523897844250569536967707854499699679468644549059879316368892300987931277361782154249992295763514822082698951936680331825288693984964651058209392398294887933203625094431173012381970684161403970198376793206832823764648042953118023287825098194558153017567173613320698112509961818815930416903515988885193458072738667385894228792284998920868058257492796104841984443634632449684875602336248270419786232090021609902353043699418491463140934317381436405462531520961836908887070167683964243781405927145635490613031072085103837505101157477041718986106873969655212671546889570350354';

/**
 * Defaults config for the evaluator
 * @type {object}
 */
const defaultConfig = {
    internalPrecision: 100,
    degree: false
};

/**
 * Defaults config for the Decimal constructor
 * @type {object}
 */
const defaultDecimalConfig = {
    defaults: true
};

/**
 * Checks if an object is empty.
 * @param {*} obj - The object to check.
 * @returns {boolean} - True if the object is empty, false otherwise.
 */
const isEmpty = obj => [Object, Array].includes((obj || {}).constructor) && !Object.entries(obj || {}).length;

/**
 * Checks if an object is a plain object.
 * @param {*} obj - The object to check.
 * @returns {boolean} - True if the object is a plain object, false otherwise.
 */
const isPlainObject = obj => [Object].includes((obj || {}).constructor) && Object.entries(obj || {}).length;

/**
 * Create a new function that calls func with args set on first place.
 * @param {function} func - The function to partially apply.
 * @param  {...*} boundArgs - The arguments to partially apply before.
 * @returns {function} - The partially applied function.
 */
function partial(func, ...boundArgs) {
    const wrapper = (...remainingArgs) => func(...boundArgs, ...remainingArgs);
    return wrapper;
}

/**
 * Create a new function that calls func with args set on last place.
 * @param {function} func - The function to partially apply.
 * @param  {...*} boundArgs - The arguments to partially apply after.
 * @returns {function} - The partially applied function.
 */
function partialRight(func, ...boundArgs) {
    const wrapper = (...remainingArgs) => func(...remainingArgs, ...boundArgs);
    return wrapper;
}

/**
 * Extracts the config entries the Decimal constructor accepts.
 * @param {object} config - The evaluator config.
 * @returns {object} - The config entries the Decimal constructor accepts.
 */
function extractDecimalConfigEntries(config) {
    const { precision, rounding, toExpNeg, toExpPos, maxE, minE, modulo, crypto } = config;
    return { precision, rounding, toExpNeg, toExpPos, maxE, minE, modulo, crypto };
}

/**
 * Extracts the config entries the Parser constructor accepts.
 * @param {object} config - The evaluator config.
 * @returns {object} - The config entries the Parser constructor accepts.
 */
function extractParserConfigEntries(config) {
    const { operators } = config;
    return { operators };
}

/**
 * Gets an arbitrary decimal precision number using a string representation.
 * @param {string} number
 * @param {number} precision
 * @returns {string}
 */
function toPrecisionNumber(number, precision) {
    const dot = number.indexOf('.');
    if (dot > 0) {
        number = number.substring(0, dot + precision + 1);
    }
    return number;
}

/**
 * Builds a maths expression parser.
 * For more info on the supported API:
 * - @see https://github.com/silentmatt/expr-eval
 * - @see https://github.com/MikeMcl/decimal.js
 *
 * @example
 * var evaluate = mathsEvaluatorFactory();
 *
 * // simple arithmetic
 * var result = evaluate("3*4+30"); // will return '42';
 *
 * // advanced expression
 * var result = evaluate("(10! - 5!) * 4 * (18 / 4) + sqrt(56^4)"); // will return '65319376';
 *
 * // parametric expression
 * var result = evaluate("2*a*x+b", {a:5, x:3, b:15}); // will return '45';
 *
 * @param {object} [config] - Config entries, mostly for the Decimal constructor.
 * @param {number} [config.precision=20] - The maximum number of significant digits of the result of an operation.
 * @param {number} [config.internalPrecision=100] - Arbitrary decimal precision for some internal related computations (sin, cos, tan, ln).
 * @param {number} [config.rounding=4] - The default rounding mode used when rounding the result of an operation to precision significant digits.
 * @param {number} [config.toExpNeg=-7] - The negative exponent value at and below which toString returns exponential notation.
 * @param {number} [config.toExpPos=21] - The positive exponent value at and above which toString returns exponential notation.
 * @param {number} [config.maxE=9e15] - The positive exponent limit, i.e. the exponent value above which overflow to Infinity occurs.
 * @param {number} [config.minE=-9e15] - The negative exponent limit, i.e. the exponent value below which underflow to zero occurs.
 * @param {number} [config.modulo=1] - The modulo mode used when calculating the modulus: a mod n.
 * @param {boolean} [config.crypto=false] - The value that determines whether cryptographically-secure pseudo-random number generation is used.
 * @param {boolean} [config.degree=false] - Converts trigonometric values from radians to degrees.
 * @param {object} [config.operators] - The list of operators to enable.
 * @returns {Function<expression, variables>} - The maths expression parser
 */
function mathsEvaluatorFactory(config) {
    const localConfig = Object.assign({}, defaultConfig, config);
    const decimalConfig = extractDecimalConfigEntries(localConfig);
    const parserConfig = extractParserConfigEntries(localConfig);
    const parser = new Parser(parserConfig);
    const ConfiguredDecimal = Decimal.set(isEmpty(decimalConfig) ? defaultDecimalConfig : decimalConfig);
    const EPSILON = new ConfiguredDecimal(2).pow(-52);
    const PI = new ConfiguredDecimal(toPrecisionNumber(numberPI, localConfig.internalPrecision));
    const E = new ConfiguredDecimal(toPrecisionNumber(numberE, localConfig.internalPrecision));

    /**
     * Map expr-eval API to decimal.js
     * @type {object}
     */
    const mapAPI = {
        unary: [
            {
                entry: 'sin',
                action(a) {
                    return trigoOperator('sin', a);
                }
            },
            {
                entry: 'cos',
                action(a) {
                    return trigoOperator('cos', a);
                }
            },
            {
                entry: 'tan',
                action(a) {
                    return trigoOperator('tan', a);
                }
            },
            {
                entry: 'asin',
                action(a) {
                    return inverseTrigoOperator('asin', a);
                }
            },
            {
                entry: 'acos',
                action(a) {
                    return inverseTrigoOperator('acos', a);
                }
            },
            {
                entry: 'atan',
                action(a) {
                    return inverseTrigoOperator('atan', a);
                }
            },
            {
                entry: 'sinh',
                mapTo: 'sinh'
            },
            {
                entry: 'cosh',
                mapTo: 'cosh'
            },
            {
                entry: 'tanh',
                mapTo: 'tanh'
            },
            {
                entry: 'asinh',
                mapTo: 'asinh'
            },
            {
                entry: 'acosh',
                mapTo: 'acosh'
            },
            {
                entry: 'atanh',
                mapTo: 'atanh'
            },
            {
                entry: 'sqrt',
                mapTo: 'sqrt'
            },
            {
                entry: 'cbrt',
                mapTo: 'cbrt'
            },
            {
                entry: 'log',
                mapTo: 'log'
            },
            {
                entry: 'ln',
                mapTo: 'ln'
            },
            {
                entry: 'lg',
                mapTo: 'log'
            },
            {
                entry: 'log10',
                mapTo: 'log'
            },
            {
                entry: 'abs',
                mapTo: 'abs'
            },
            {
                entry: 'ceil',
                mapTo: 'ceil'
            },
            {
                entry: 'floor',
                mapTo: 'floor'
            },
            {
                entry: 'round',
                mapTo: 'round'
            },
            {
                entry: 'trunc',
                mapTo: 'trunc'
            },
            {
                entry: '-',
                mapTo: 'neg'
            },
            {
                entry: '+',
                action: decimalNumber
            },
            {
                entry: 'exp',
                mapTo: 'exp'
            },
            {
                entry: 'not',
                action(a) {
                    return !native(a);
                }
            },
            {
                entry: '!',
                action: useOrigin
            },
            {
                entry: '#',
                action: percent
            }
        ],
        binary: [
            {
                entry: '+',
                mapTo: 'add'
            },
            {
                entry: '-',
                mapTo: 'sub'
            },
            {
                entry: '*',
                mapTo: 'mul'
            },
            {
                entry: '/',
                mapTo: 'div'
            },
            {
                entry: '%',
                mapTo: 'mod'
            },
            {
                entry: '^',
                mapTo: 'pow'
            },
            {
                entry: '==',
                mapTo: 'equals'
            },
            {
                entry: '!=',
                action(a, b) {
                    return !binaryOperator('equals', a, b);
                }
            },
            {
                entry: '>',
                mapTo: 'gt'
            },
            {
                entry: '<',
                mapTo: 'lt'
            },
            {
                entry: '>=',
                mapTo: 'gte'
            },
            {
                entry: '<=',
                mapTo: 'lte'
            },
            {
                entry: 'and',
                action(a, b) {
                    return Boolean(native(a) && native(b));
                }
            },
            {
                entry: 'or',
                action(a, b) {
                    return Boolean(native(a) || native(b));
                }
            },
            {
                entry: 'in',
                action(array, obj) {
                    obj = native(obj);
                    return Array.isArray(array) && 'undefined' !== typeof array.find(el => native(el) === obj);
                }
            }
        ],
        ternaryOps: [
            {
                entry: '?',
                action: useOrigin
            }
        ],
        functions: [
            {
                entry: 'random',
                action(dp) {
                    return ConfiguredDecimal.random(dp);
                }
            },
            {
                entry: 'fac',
                action: useOrigin
            },
            {
                entry: 'min',
                mapTo: 'min'
            },
            {
                entry: 'max',
                mapTo: 'max'
            },
            {
                entry: 'hypot',
                action: useOrigin
            },
            {
                entry: 'pyt',
                action: useOrigin
            },
            {
                entry: 'pow',
                mapTo: 'pow'
            },
            {
                entry: 'atan2',
                action(y, x) {
                    const result = functionOperator('atan2', y, x);
                    return localConfig.degree ? radianToDegree(result) : result;
                }
            },
            {
                entry: 'if',
                action: useOrigin
            },
            {
                entry: 'gamma',
                action: useOrigin
            },
            {
                entry: 'roundTo',
                action: useOrigin
            },
            {
                entry: 'nthrt',
                action(n, x) {
                    x = decimalNumber(x);
                    n = parseInt(n, 10);
                    if (x.isNeg() && n % 2 !== 1) {
                        // not a real number (complex not supported)
                        return decimalNumber(NaN);
                    }
                    return x.abs().pow(decimalNumber(1).div(n)).mul(Decimal.sign(x));
                }
            },
            {
                entry: 'percent',
                action: percent
            }
        ],
        consts: [
            {
                entry: 'PI',
                value: PI
            },
            {
                entry: 'E',
                value: E
            },
            {
                entry: 'EPSILON',
                value: EPSILON
            },
            {
                entry: 'TEN',
                value: 10
            }
        ]
    };

    /**
     * Turns a number into a percentage.
     * `10%` will be replaced by `0.1`.
     * @param {Decimal} number
     * @returns {Decimal}
     */
    function percent(number) {
        return decimalNumber(number).div(100);
    }

    /**
     * Takes care of zero-like values.
     * i.e. value smaller than the smallest double precision datatype value is considered equal to zero
     * @param {Decimal} number
     * @returns {Decimal}
     */
    function checkZero(number) {
        if (number.absoluteValue().lessThan(EPSILON)) {
            return new ConfiguredDecimal(0);
        }
        return number;
    }

    /**
     * Cast a Decimal to native type
     * @param {number|string|Decimal} number
     * @returns {number|boolean|string} - Always returns a native type
     */
    function native(number) {
        if (Decimal.isDecimal(number)) {
            return number.toNumber();
        } else if (number === 'true' || number === true) {
            return true;
        } else if (number === 'false' || number === false) {
            return false;
        }
        return number;
    }

    /**
     * Map an original function using possible Decimal arguments
     * @param {...*} args
     * @returns {*}
     */
    function useOrigin(...args) {
        const origin = args.pop();
        return origin.apply(this, args.map(native));
    }

    /**
     * Cast a native number to Decimal
     * @param {number|string|Decimal} number
     * @returns {Decimal} - Always returns a Decimal
     */
    function decimalNumber(number) {
        if (!Decimal.isDecimal(number)) {
            number = new ConfiguredDecimal(number);
        }
        return number;
    }

    /**
     * Converts degrees to radians
     * @param {number|string|Decimal} value
     * @returns {Decimal} - Always returns a Decimal
     */
    function degreeToRadian(value) {
        return decimalNumber(value).mul(PI).div(180);
    }

    /**
     * Converts radians to degrees
     * @param {number|string|Decimal} value
     * @returns {Decimal} - Always returns a Decimal
     */
    function radianToDegree(value) {
        return decimalNumber(value).mul(180).div(PI);
    }

    /**
     * Apply the mentioned unary operator on an operand
     * @param {string} operator - The operator to apply
     * @param {number|string|Decimal} operand - The operand on which apply the operator
     * @returns {Decimal} - Always returns a Decimal
     */
    function unaryOperator(operator, operand) {
        operand = decimalNumber(operand);
        if ('function' !== typeof operand[operator]) {
            throw new TypeError(`${operator} is not a valid operator!`);
        }
        return operand[operator]();
    }

    /**
     * Apply the mentioned binary operator on the operands
     * @param {string} operator - The operator to apply
     * @param {number|string|Decimal} left - Left operand
     * @param {number|string|Decimal} right - Right operand
     * @returns {Decimal} - Always returns a Decimal
     */
    function binaryOperator(operator, left, right) {
        left = decimalNumber(left);
        if ('function' !== typeof left[operator]) {
            throw new TypeError(`${operator} is not a valid operator!`);
        }
        return left[operator](decimalNumber(right));
    }

    /**
     * Apply the mentioned function operator on the operands
     * @param {string} operator - The operator to apply
     * @param {number|string|Decimal} operands
     * @returns {Decimal} - Always returns a Decimal
     */
    function functionOperator(operator, ...operands) {
        if ('function' !== typeof ConfiguredDecimal[operator]) {
            throw new TypeError(`${operator} is not a valid function!`);
        }

        return ConfiguredDecimal[operator](...operands.map(decimalNumber));
    }

    /**
     * Apply the mentioned trigonometric operator on an operand, taking care of the unit (degree or radian)
     * @param {string} operator - The operator to apply
     * @param {number|string|Decimal} operand - The operand on which apply the operator
     * @returns {Decimal} - Always returns a Decimal
     */
    function trigoOperator(operator, operand) {
        if ('function' !== typeof Decimal[operator]) {
            throw new TypeError(`${operator} is not a valid operator!`);
        }

        if (localConfig.degree) {
            operand = degreeToRadian(operand);
        } else {
            operand = decimalNumber(operand);
        }

        if (operator === 'tan' && operand.equals(PI.div(2))) {
            return new ConfiguredDecimal(NaN);
        }

        return checkZero(ConfiguredDecimal[operator](operand));
    }

    /**
     * Apply the mentioned inverse trigonometric operator on an operand, taking care of the unit (degree or radian)
     * @param {string} operator - The operator to apply
     * @param {number|string|Decimal} operand - The operand on which apply the operator
     * @returns {Decimal} - Always returns a Decimal
     */
    function inverseTrigoOperator(operator, operand) {
        const result = checkZero(unaryOperator(operator, operand));
        return localConfig.degree ? radianToDegree(result) : result;
    }

    /**
     * Map the API
     * @param {function} wrapper
     * @param {object} origin
     * @param {object} api
     */
    function mapping(wrapper, origin, api) {
        let fn;
        if (api.value) {
            fn = api.value;
        } else if (api.action) {
            fn = partialRight(api.action, origin[api.entry]);
        } else {
            fn = partial(wrapper, api.mapTo);
        }
        origin[api.entry] = fn;
    }

    /**
     * The exposed parser
     *
     * @param {string|mathsExpression} expression - The expression to evaluate
     * @param {object} [variables] - Optional variables to use from the expression
     * @returns {mathsExpression}
     */
    function evaluate(expression, variables) {
        if (isPlainObject(expression)) {
            variables = variables || expression.variables;
            expression = expression.expression;
        }
        if ('string' !== typeof expression) {
            expression = `${expression}`;
        }

        const parsedExpression = parser.parse(expression);
        const result = parsedExpression.evaluate(variables);
        const value = native(result);

        /**
         * @typedef {object} mathsExpression
         * @property {string} expression - The evaluated expression
         * @property {object} variables - Optional variables used from the expression
         * @property {Decimal|number|boolean|string} result - The result of the expression, as returned by the evaluator
         * @property {boolean|string} value - The result of the expression, as a native value
         */
        return {
            expression,
            variables,
            result,
            value
        };
    }

    // replace built-in operators and functions in expr-eval by those from decimal.js
    mapAPI.unary.forEach(partial(mapping, unaryOperator, parser.unaryOps));
    mapAPI.binary.forEach(partial(mapping, binaryOperator, parser.binaryOps));
    mapAPI.ternaryOps.forEach(partial(mapping, functionOperator, parser.ternaryOps));
    mapAPI.functions.forEach(partial(mapping, functionOperator, parser.functions));
    mapAPI.consts.forEach(partial(mapping, null, parser.consts));

    // expose the parser
    evaluate.parser = parser;

    return evaluate;
}

export default mathsEvaluatorFactory;
