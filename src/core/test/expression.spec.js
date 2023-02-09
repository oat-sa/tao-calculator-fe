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
 * Copyright (c) 2019-2023 (original work) Open Assessment Technologies SA ;
 */

import expressionHelper from '../expression.js';
import mathsEvaluatorFactory from '../mathsEvaluator.js';

const mathsEvaluator = mathsEvaluatorFactory();
const mathsResults = {
    '3*4': mathsEvaluator('3*4'),
    PI: mathsEvaluator('PI'),
    '1/3': mathsEvaluator('1/3'),
    '2/3': mathsEvaluator('2/3'),
    '123e50': mathsEvaluator('123e50'),
    'PI*10^50': mathsEvaluator('PI*10^50')
};
const tokens = {
    '#0': { type: 'NUM0', value: '0' },
    '#1': { type: 'NUM1', value: '1' },
    '#2': { type: 'NUM2', value: '2' },
    '#3': { type: 'NUM3', value: '3' },
    '#4': { type: 'NUM4', value: '4' },
    '#5': { type: 'NUM5', value: '5' },
    '+': { type: 'ADD', value: '+' },
    '*': { type: 'MUL', value: '*' },
    '^': { type: 'POW', value: '^' },
    '(': { type: 'LPAR', value: '(' },
    ')': { type: 'RPAR', value: ')' },
    nthrt: { type: 'NTHRT', value: '@nthrt' },
    ans: { type: 'ANS', value: 'ans' }
};
const lastAnswerToken = {
    value: 'ans',
    type: 'variable'
};

describe('expression', () => {
    it('is a namespace', () => {
        expect(expressionHelper).toEqual(expect.any(Object));
    });

    describe('containsError', () => {
        it('is function', () => {
            expect(expressionHelper.containsError).toEqual(expect.any(Function));
        });

        it('checks an expression contains an error', () => {
            expect(expressionHelper.containsError('3*4')).toBeFalsy();
            expect(expressionHelper.containsError('NaN')).toBeTruthy();
            expect(expressionHelper.containsError('Infinity')).toBeTruthy();
            expect(expressionHelper.containsError('+Infinity')).toBeTruthy();
            expect(expressionHelper.containsError('-Infinity')).toBeTruthy();
            expect(expressionHelper.containsError('2*NaN')).toBeTruthy();
            expect(expressionHelper.containsError('4-Infinity')).toBeTruthy();
            expect(expressionHelper.containsError(NaN)).toBeTruthy();
            expect(expressionHelper.containsError(10)).toBeFalsy();
            expect(expressionHelper.containsError({ value: NaN })).toBeTruthy();
            expect(expressionHelper.containsError({ value: 'NaN' })).toBeTruthy();
            expect(expressionHelper.containsError({ value: '0' })).toBeFalsy();
        });
    });

    describe('replaceLastResult', () => {
        it('is function', () => {
            expect(expressionHelper.replaceLastResult).toEqual(expect.any(Function));
        });

        it.each([
            ['Normal expression', { expression: '3*4', expected: '3*4' }],
            ['Number expression', { expression: 42, expected: '42' }],
            ['Not a Number', { expression: NaN, expected: 'NaN' }],
            [
                'Object expression containing value',
                { expression: { value: 'cos PI * (40 + 2)' }, expected: 'cos PI * (40 + 2)' }
            ],
            [
                'Object expression containing result',
                { expression: { result: 'cos PI * (40 + 2)' }, expected: 'cos PI * (40 + 2)' }
            ],
            ['Void object expression', { expression: {}, expected: '' }],
            ['Null expression', { expression: null, expected: '' }],
            ['No expression', { expected: '' }],
            ['Simple value', { expression: 'ans', value: '42', expected: '42' }],
            ['Simple value in expression', { expression: '3*ans+1', value: '42', expected: '3*42+1' }],
            ['Multiple values in expression', { expression: '3*ans+1/ans+ans', value: '5', expected: '3*5+1/5+5' }],
            ['Object value in expression', { expression: '3*ans+1', value: { value: '42' }, expected: '3*42+1' }],
            ['NaN in expression', { expression: '3*ans+1', value: { value: NaN }, expected: '3*NaN+1' }],
            ['No value', { expression: 'ans', expected: '0' }]
        ])('replace the last result in "%s"', (title, data) => {
            expect(expressionHelper.replaceLastResult(data.expression, data.value)).toEqual(data.expected);
        });

        describe('roundVariable', () => {
            it('is function', () => {
                expect(expressionHelper.roundVariable).toEqual(expect.any(Function));
            });

            it.each([
                ['Undefined variable', { expected: '' }],
                ['Empty variable', { variable: {}, expected: '' }],
                ['Native number', { variable: 5, decimalDigits: 8, expected: '5' }],
                [
                    'String value',
                    { variable: '3.14159265358979323846264', decimalDigits: 8, expected: '3.14159265358979323846264' }
                ],
                ['Regular integer result', { variable: mathsResults['3*4'], expected: '12' }],
                ['Regular decimal result', { variable: mathsResults.PI, expected: '3.14159~' }],
                ['5 significant digits', { variable: mathsResults.PI, decimalDigits: 3, expected: '3.142~' }],
                ['10 significant digits', { variable: mathsResults.PI, decimalDigits: 10, expected: '3.1415926536~' }],
                ['Irrational 1/3', { variable: mathsResults['1/3'], expected: '0.33333~' }],
                ['Irrational 2/3', { variable: mathsResults['2/3'], expected: '0.66667~' }],
                ['Exponential integer', { variable: mathsResults['123e50'], expected: '1.23e+52' }],
                ['Exponential decimal', { variable: mathsResults['PI*10^50'], expected: '3.14159e+50~' }]
            ])('round the variable in "%s"', (title, data) => {
                expect(expressionHelper.roundVariable(data.variable, data.decimalDigits)).toEqual(data.expected);
            });
        });

        describe('roundAllVariables', () => {
            it('is function', () => {
                expect(expressionHelper.roundAllVariables).toEqual(expect.any(Function));
            });

            it.each([
                ['Undefined list of variables', {}],
                ['Empty list of variables', { variables: {}, expected: {} }],
                [
                    'Native number',
                    { variables: { ans: 5, foo: 5 }, decimalDigits: 8, expected: { ans: '5', foo: '5' } }
                ],
                [
                    'String value',
                    {
                        variables: { ans: '3.14159265358979323846264', foo: '1.23456789123456789' },
                        decimalDigits: 8,
                        expected: { ans: '3.14159265358979323846264', foo: '1.23456789123456789' }
                    }
                ],
                [
                    'Regular integer result',
                    {
                        variables: { ans: mathsResults['3*4'], foo: mathsResults['3*4'] },
                        expected: { ans: '12', foo: '12' }
                    }
                ],
                [
                    'Regular decimal result',
                    {
                        variables: { ans: mathsResults.PI, foo: mathsResults['1/3'] },
                        expected: { ans: '3.14159~', foo: '0.33333~' }
                    }
                ],
                [
                    '5 significant digits',
                    {
                        variables: { ans: mathsResults.PI, foo: mathsResults['1/3'] },
                        decimalDigits: 3,
                        expected: { ans: '3.142~', foo: '0.333~' }
                    }
                ],
                [
                    '10 significant digits',
                    {
                        variables: { ans: mathsResults.PI, foo: mathsResults['1/3'] },
                        decimalDigits: 10,
                        expected: { ans: '3.1415926536~', foo: '0.3333333333~' }
                    }
                ],
                [
                    'Irrational 1/3',
                    {
                        variables: { ans: mathsResults['1/3'], foo: mathsResults['1/3'] },
                        expected: { ans: '0.33333~', foo: '0.33333~' }
                    }
                ],
                [
                    'Irrational 2/3',
                    {
                        variables: { ans: mathsResults['2/3'], foo: mathsResults['2/3'] },
                        expected: { ans: '0.66667~', foo: '0.66667~' }
                    }
                ],
                [
                    'Exponential integer',
                    {
                        variables: { ans: mathsResults['123e50'], foo: mathsResults['123e50'] },
                        expected: { ans: '1.23e+52', foo: '1.23e+52' }
                    }
                ],
                [
                    'Exponential decimal',
                    {
                        variables: { ans: mathsResults['PI*10^50'], foo: mathsResults['PI*10^50'] },
                        expected: { ans: '3.14159e+50~', foo: '3.14159e+50~' }
                    }
                ]
            ])('round the last result variable in "%s"', (title, data) => {
                expect(expressionHelper.roundAllVariables(data.variables, data.decimalDigits)).toEqual(data.expected);
            });
        });

        describe('renderSign', () => {
            it('is function', () => {
                expect(expressionHelper.renderSign).toEqual(expect.any(Function));
            });

            it('replace the operator by the sign', () => {
                expect(expressionHelper.renderSign()).toStrictEqual('');
                expect(expressionHelper.renderSign('')).toStrictEqual('');
                expect(expressionHelper.renderSign('42')).toStrictEqual('42');
                expect(expressionHelper.renderSign('-42')).toStrictEqual(`-42`);
                expect(expressionHelper.renderSign('+42')).toStrictEqual(`+42`);
                expect(expressionHelper.renderSign('3-4+2')).toStrictEqual(`3-4+2`);
                expect(expressionHelper.renderSign('\uFF0D42')).toStrictEqual(`-42`);
                expect(expressionHelper.renderSign('\uFF0B42')).toStrictEqual(`+42`);
                expect(expressionHelper.renderSign('3\uFF0D4\uFF0B2')).toStrictEqual(`3-4+2`);
            });
        });

        describe('render', () => {
            it('is function', () => {
                expect(expressionHelper.render).toEqual(expect.any(Function));
            });

            it.each([
                ['Undefined list', void 0, void 0],
                ['Void list', [], {}],
                ['Simple number', '42', {}],
                ['Simple expression', '40+2', {}],
                ['Negative value', '-42', {}],
                ['Negative expression', '-(4+2)', {}],
                ['Explicit positive value', '+42', {}],
                ['Explicit positive expression', '+(4+2)', {}],
                ['Last result, no variable', lastAnswerToken, {}],
                ['Last result, positive value', lastAnswerToken, { ans: '42' }],
                ['Last result, negative value', lastAnswerToken, { ans: '-42' }],
                ['Last result, explicit positive value', lastAnswerToken, { ans: '+42' }],
                [
                    'Last result, mathsExpression',
                    lastAnswerToken,
                    {
                        ans: {
                            expression: '40+2',
                            value: 42
                        }
                    }
                ],
                [
                    'Last result, mathsExpression with tokens',
                    lastAnswerToken,
                    {
                        ans: {
                            expression: '40+2',
                            value: 42,
                            tokens: [tokens['#4'], tokens['#2']]
                        }
                    }
                ],
                ['Expression with variables', '40+2-x*ans*y', { ans: 5, x: 0 }],
                ['Left exponent: nthrt', '@nthrt', {}],
                ['Left exponent: 4 nthrt', '4 @nthrt', {}],
                ['Left exponent: nthrt nthrt', '@nthrt @nthrt', {}],
                ['Left exponent: nthrt 16', '@nthrt 16', {}],
                ['Left exponent: 4 nthrt 16', '4 @nthrt 16', {}],
                ['Left exponent: -4 nthrt 16', '-4 @nthrt 16', {}],
                ['Left exponent: (4 nthrt 16)', '(4 @nthrt 16)', {}],
                ['Left exponent: (5+4) nthrt 16', '(5+4) @nthrt 16', {}],
                ['Left exponent: -(5+4) nthrt 16', '-(5+4) @nthrt 16', {}],
                ['Left exponent: ((5+4*(2-x)) nthrt 16)', '((5+4*(2-x)) @nthrt 16)', { x: 2 }],
                ['Left exponent: 5+4 nthrt 16', '5+4 @nthrt 16', {}],
                ['Left exponent: 5+(4 nthrt 16)', '5+(4 @nthrt 16)', {}],
                ['Left exponent: 114 nthrt (ans*3)', '114 @nthrt (ans*3)', { ans: 5 }],
                ['Left exponent: (5+114) nthrt (ans*3)', '(5+114) @nthrt (ans*3)', { ans: 5 }],
                ['Left exponent: 5+114 nthrt (ans*3)', '5+114 @nthrt (ans*3)', { ans: 5 }],
                ['Left exponent: 3*(4+2)nthrt(ans*3)', '3*(4+2)@nthrt(ans*3)', { ans: 5 }],
                ['Left exponent: ceil cos PI nthrt 4', 'ceil cos PI @nthrt 4', {}],
                ['Left exponent: cos PI nthrt 4', 'cos PI @nthrt 4', {}],
                ['Left exponent: (cos PI) nthrt 4', '(cos PI) @nthrt 4', {}],
                ['Left exponent: cos (PI) nthrt 4', 'cos (PI) @nthrt 4', {}],
                ['Left exponent: PI nthrt PI nthrt 4', 'PI @nthrt PI @nthrt 4', {}],
                ['Left exponent: PI nthrt (PI+4) nthrt 4', 'PI @nthrt (PI+4) @nthrt 4', {}],
                ['Left exponent: (PI nthrt PI) nthrt 4', '(PI @nthrt PI) @nthrt 4', {}],
                ['Left exponent: PI nthrt (PI nthrt 4)', 'PI @nthrt (PI @nthrt 4)', {}],
                ['Left exponent: 10 nthrt PI nthrt 4', '10 @nthrt PI @nthrt 4', {}],
                ['Left exponent: 5+10 nthrt PI nthrt 4', '5+10 @nthrt PI @nthrt 4', {}],
                ['Left exponent: 5+10 nthrt cos PI', '5+10 @nthrt cos PI', {}],
                ['Right exponent: ^', '^', {}],
                ['Right exponent: 2^', '2^', {}],
                ['Right exponent: 2^4', '2^4', {}],
                ['Right exponent: 2^4^', '2^4^', {}],
                ['Right exponent: 2^4^-', '2^4^-', {}],
                ['Right exponent: 2^4^-2', '2^4^-2', {}],
                ['Right exponent: 2^4^+', '2^4^+', {}],
                ['Right exponent: 2^4^+2', '2^4^+2', {}],
                ['Right exponent: (2^4)', '(2^4)', {}],
                ['Right exponent: 2^PI', '2^PI', {}],
                ['Right exponent: (2^PI)', '(2^PI)', {}],
                ['Right exponent: 2^2^2', '2^2^2', {}],
                ['Right exponent: (2^2^2)', '(2^2^2)', {}],
                ['Right exponent: (2^2)^2', '(2^2)^2', {}],
                ['Right exponent: 2^(2^2)', '2^(2^2)', {}],
                ['Right exponent: 2^cos PI', '2^cos PI', {}],
                ['Right exponent: 2^cos(PI * 2)', '2^cos(PI * 2)', {}],
                ['Right exponent: 2^ceil cos(PI * 2)', '2^ceil cos(PI * 2)', {}],
                ['Right exponent: 42^123', '42^123', {}],
                ['Right exponent: 5^-1', '5^-1', {}],
                ['Right exponent: 5^+2', '5^+2', {}],
                ['Right exponent: (4+2)^3+5', '(4+2)^3+5', {}],
                ['Right exponent: 4+2^(3+5)', '4+2^(3+5)', {}],
                ['Right exponent: (4+2)^x+5', '(4+2)^x+5', { x: '3' }],
                ['Right exponent: 4+2^(x+5)', '4+2^(x+5)', { x: '3' }],
                ['Right exponent: (4+2)^123+5', '(4+2)^123+5', {}],
                ['Right exponent: 4+2^(123+5)', '4+2^(123+5)', {}],
                ['Right exponent: (4+2)^(3*4)+5', '(4+2)^(3*4)+5', {}],
                ['Right exponent: x^((4+2)^(3*4))+5', 'x^((4+2)^(3*4))+5', { x: 0 }],
                ['Right exponent: (4+2^3)^(ans*3^2)+5', '(4+2^3)^(ans*3^2)+5', { ans: 5 }],
                ['Right exponent: 5e10', '5e10', {}],
                ['Right exponent: 5e+10', '5e+10', {}],
                ['Right exponent: 5e-10', '5e-10', {}],
                ['Exponent: !3 nthrt 2^3!', '!3 @nthrt 2^3!', { ans: 5 }],
                ['Exponent: (!3) nthrt (2^(3!))', '(!3) @nthrt (2^(3!))', { ans: 5 }],
                ['Exponent: 8^8 nthrt 8', '8^8 @nthrt 8', { ans: 5 }],
                ['Exponent: 8^(8 nthrt 8)', '8^(8 @nthrt 8)', { ans: 5 }],
                ['Exponent: (8^8) nthrt 8', '(8^8) @nthrt 8', { ans: 5 }],
                [
                    'Tokenized expression',
                    [
                        tokens['#5'],
                        tokens['+'],
                        tokens['#1'],
                        tokens['#0'],
                        tokens.nthrt,
                        tokens['('],
                        tokens['#4'],
                        tokens['+'],
                        tokens['#2'],
                        tokens['^'],
                        tokens['#3'],
                        tokens[')'],
                        tokens['^'],
                        tokens['('],
                        tokens.ans,
                        tokens['*'],
                        tokens['#3'],
                        tokens['^'],
                        tokens['#2'],
                        tokens[')'],
                        tokens['+'],
                        tokens['#5']
                    ],
                    { ans: 5 }
                ]
            ])('render from %s', (title, expression, variables) => {
                expect(expressionHelper.render(expression, variables)).toMatchSnapshot();
            });
        });

        describe('nestExponents', () => {
            it('is function', () => {
                expect(expressionHelper.nestExponents).toEqual(expect.any(Function));
            });

            it.each([
                ['3*(4-5)'],
                ['2^3+5'],
                ['4-2^3^5^7+3'],
                ['4-7 @nthrt 5 @nthrt 3 @nthrt 2+3'],
                ['(3*4^(8-2)) @nthrt 4 + exp(2^(3+5)+4) + PI']
            ])('render nested exponents from %s', expression => {
                const renderedTerms = expressionHelper.render(expression);
                expect(expressionHelper.nestExponents(renderedTerms)).toMatchSnapshot();
            });
        });
    });
});
