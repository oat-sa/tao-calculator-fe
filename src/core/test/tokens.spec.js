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

import tokensHelper from '../tokens.js';

const types = {
    digit: 'digit',
    operator: 'operator',
    aggregator: 'aggregator',
    separator: 'separator',
    variable: 'variable',
    constant: 'constant',
    term: 'term',
    error: 'error',
    function: 'function'
};

describe('tokens', () => {
    it('is a namespace', () => {
        expect(tokensHelper).toEqual(expect.any(Object));
    });

    describe('getType', () => {
        it('is a function', () => {
            expect(tokensHelper.getType).toEqual(expect.any(Function));
        });

        it('passthrough a type', () => {
            expect(tokensHelper.getType(types.digit)).toEqual(types.digit);
        });

        it('extracts the type', () => {
            expect(tokensHelper.getType({ type: types.digit })).toEqual(types.digit);
            expect(tokensHelper.getType({ type: types.operator })).toEqual(types.operator);
        });

        it('detects the type', () => {
            expect(tokensHelper.getType({ type: 'NUM0' })).toEqual(types.digit);
            expect(tokensHelper.getType({ type: 'ADD' })).toEqual(types.operator);
        });

        it('ignore inconsistent data', () => {
            expect(tokensHelper.getType({})).toBeNull();
            expect(tokensHelper.getType()).toBeNull();
        });
    });

    describe('isDigit', () => {
        it('is a function', () => {
            expect(tokensHelper.isDigit).toEqual(expect.any(Function));
        });

        it('passthrough a type', () => {
            expect(tokensHelper.isDigit(types.digit)).toBeTruthy();
            expect(tokensHelper.isDigit(types.operator)).toBeFalsy();
            expect(tokensHelper.isDigit(types.aggregator)).toBeFalsy();
            expect(tokensHelper.isDigit(types.separator)).toBeFalsy();
            expect(tokensHelper.isDigit(types.variable)).toBeFalsy();
            expect(tokensHelper.isDigit(types.constant)).toBeFalsy();
            expect(tokensHelper.isDigit(types.term)).toBeFalsy();
            expect(tokensHelper.isDigit(types.error)).toBeFalsy();
            expect(tokensHelper.isDigit(types.function)).toBeFalsy();
        });

        it('extracts the type', () => {
            expect(tokensHelper.isDigit({ type: types.digit })).toBeTruthy();
            expect(tokensHelper.isDigit({ type: types.operator })).toBeFalsy();
            expect(tokensHelper.isDigit({ type: types.aggregator })).toBeFalsy();
            expect(tokensHelper.isDigit({ type: types.separator })).toBeFalsy();
            expect(tokensHelper.isDigit({ type: types.variable })).toBeFalsy();
            expect(tokensHelper.isDigit({ type: types.constant })).toBeFalsy();
            expect(tokensHelper.isDigit({ type: types.term })).toBeFalsy();
            expect(tokensHelper.isDigit({ type: types.error })).toBeFalsy();
            expect(tokensHelper.isDigit({ type: types.function })).toBeFalsy();
        });

        it('detects the type', () => {
            expect(tokensHelper.isDigit({ type: 'NUM0' })).toBeTruthy();
            expect(tokensHelper.isDigit({ type: 'ADD' })).toBeFalsy();
            expect(tokensHelper.isDigit({ type: 'LPAR' })).toBeFalsy();
            expect(tokensHelper.isDigit({ type: 'COMMA' })).toBeFalsy();
            expect(tokensHelper.isDigit({ type: 'ANS' })).toBeFalsy();
            expect(tokensHelper.isDigit({ type: 'PI' })).toBeFalsy();
            expect(tokensHelper.isDigit({ type: 'NAN' })).toBeFalsy();
            expect(tokensHelper.isDigit({ type: 'SQRT' })).toBeFalsy();
        });

        it('ignore inconsistent data', () => {
            expect(tokensHelper.isDigit({})).toBeFalsy();
            expect(tokensHelper.isDigit()).toBeFalsy();
        });
    });

    describe('isOperator', () => {
        it('is a function', () => {
            expect(tokensHelper.isOperator).toEqual(expect.any(Function));
        });

        it('passthrough a type', () => {
            expect(tokensHelper.isOperator(types.digit)).toBeFalsy();
            expect(tokensHelper.isOperator(types.operator)).toBeTruthy();
            expect(tokensHelper.isOperator(types.aggregator)).toBeFalsy();
            expect(tokensHelper.isOperator(types.separator)).toBeFalsy();
            expect(tokensHelper.isOperator(types.variable)).toBeFalsy();
            expect(tokensHelper.isOperator(types.constant)).toBeFalsy();
            expect(tokensHelper.isOperator(types.term)).toBeFalsy();
            expect(tokensHelper.isOperator(types.error)).toBeFalsy();
            expect(tokensHelper.isOperator(types.function)).toBeFalsy();
        });

        it('extracts the type', () => {
            expect(tokensHelper.isOperator({ type: types.digit })).toBeFalsy();
            expect(tokensHelper.isOperator({ type: types.operator })).toBeTruthy();
            expect(tokensHelper.isOperator({ type: types.aggregator })).toBeFalsy();
            expect(tokensHelper.isOperator({ type: types.separator })).toBeFalsy();
            expect(tokensHelper.isOperator({ type: types.variable })).toBeFalsy();
            expect(tokensHelper.isOperator({ type: types.constant })).toBeFalsy();
            expect(tokensHelper.isOperator({ type: types.term })).toBeFalsy();
            expect(tokensHelper.isOperator({ type: types.error })).toBeFalsy();
            expect(tokensHelper.isOperator({ type: types.function })).toBeFalsy();
        });

        it('detects the type', () => {
            expect(tokensHelper.isOperator({ type: 'NUM0' })).toBeFalsy();
            expect(tokensHelper.isOperator({ type: 'ADD' })).toBeTruthy();
            expect(tokensHelper.isOperator({ type: 'LPAR' })).toBeFalsy();
            expect(tokensHelper.isOperator({ type: 'COMMA' })).toBeFalsy();
            expect(tokensHelper.isOperator({ type: 'ANS' })).toBeFalsy();
            expect(tokensHelper.isOperator({ type: 'PI' })).toBeFalsy();
            expect(tokensHelper.isOperator({ type: 'NAN' })).toBeFalsy();
            expect(tokensHelper.isOperator({ type: 'SQRT' })).toBeFalsy();
        });

        it('ignore inconsistent data', () => {
            expect(tokensHelper.isOperator({})).toBeFalsy();
            expect(tokensHelper.isOperator()).toBeFalsy();
        });
    });

    describe('isOperand', () => {
        it('is a function', () => {
            expect(tokensHelper.isOperand).toEqual(expect.any(Function));
        });

        it('passthrough a type', () => {
            expect(tokensHelper.isOperand(types.digit)).toBeTruthy();
            expect(tokensHelper.isOperand(types.operator)).toBeFalsy();
            expect(tokensHelper.isOperand(types.aggregator)).toBeFalsy();
            expect(tokensHelper.isOperand(types.separator)).toBeFalsy();
            expect(tokensHelper.isOperand(types.variable)).toBeTruthy();
            expect(tokensHelper.isOperand(types.constant)).toBeTruthy();
            expect(tokensHelper.isOperand(types.term)).toBeTruthy();
            expect(tokensHelper.isOperand(types.error)).toBeTruthy();
            expect(tokensHelper.isOperand(types.function)).toBeTruthy();
        });

        it('extracts the type', () => {
            expect(tokensHelper.isOperand({ type: types.digit })).toBeTruthy();
            expect(tokensHelper.isOperand({ type: types.operator })).toBeFalsy();
            expect(tokensHelper.isOperand({ type: types.aggregator })).toBeFalsy();
            expect(tokensHelper.isOperand({ type: types.separator })).toBeFalsy();
            expect(tokensHelper.isOperand({ type: types.variable })).toBeTruthy();
            expect(tokensHelper.isOperand({ type: types.constant })).toBeTruthy();
            expect(tokensHelper.isOperand({ type: types.term })).toBeTruthy();
            expect(tokensHelper.isOperand({ type: types.error })).toBeTruthy();
            expect(tokensHelper.isOperand({ type: types.function })).toBeTruthy();
        });

        it('detects the type', () => {
            expect(tokensHelper.isOperand({ type: 'NUM0' })).toBeTruthy();
            expect(tokensHelper.isOperand({ type: 'ADD' })).toBeFalsy();
            expect(tokensHelper.isOperand({ type: 'LPAR' })).toBeFalsy();
            expect(tokensHelper.isOperand({ type: 'COMMA' })).toBeFalsy();
            expect(tokensHelper.isOperand({ type: 'ANS' })).toBeTruthy();
            expect(tokensHelper.isOperand({ type: 'PI' })).toBeTruthy();
            expect(tokensHelper.isOperand({ type: 'NAN' })).toBeTruthy();
            expect(tokensHelper.isOperand({ type: 'SQRT' })).toBeTruthy();
        });

        it('ignore inconsistent data', () => {
            expect(tokensHelper.isOperand({})).toBeTruthy();
            expect(tokensHelper.isOperand()).toBeTruthy();
        });
    });

    describe('isValue', () => {
        it('is a function', () => {
            expect(tokensHelper.isValue).toEqual(expect.any(Function));
        });

        it('passthrough a type', () => {
            expect(tokensHelper.isValue(types.digit)).toBeTruthy();
            expect(tokensHelper.isValue(types.operator)).toBeFalsy();
            expect(tokensHelper.isValue(types.aggregator)).toBeFalsy();
            expect(tokensHelper.isValue(types.separator)).toBeFalsy();
            expect(tokensHelper.isValue(types.variable)).toBeTruthy();
            expect(tokensHelper.isValue(types.constant)).toBeTruthy();
            expect(tokensHelper.isValue(types.term)).toBeTruthy();
            expect(tokensHelper.isValue(types.error)).toBeTruthy();
            expect(tokensHelper.isValue(types.function)).toBeFalsy();
        });

        it('extracts the type', () => {
            expect(tokensHelper.isValue({ type: types.digit })).toBeTruthy();
            expect(tokensHelper.isValue({ type: types.operator })).toBeFalsy();
            expect(tokensHelper.isValue({ type: types.aggregator })).toBeFalsy();
            expect(tokensHelper.isValue({ type: types.separator })).toBeFalsy();
            expect(tokensHelper.isValue({ type: types.variable })).toBeTruthy();
            expect(tokensHelper.isValue({ type: types.constant })).toBeTruthy();
            expect(tokensHelper.isValue({ type: types.term })).toBeTruthy();
            expect(tokensHelper.isValue({ type: types.error })).toBeTruthy();
            expect(tokensHelper.isValue({ type: types.function })).toBeFalsy();
        });

        it('detects the type', () => {
            expect(tokensHelper.isValue({ type: 'NUM0' })).toBeTruthy();
            expect(tokensHelper.isValue({ type: 'ADD' })).toBeFalsy();
            expect(tokensHelper.isValue({ type: 'LPAR' })).toBeFalsy();
            expect(tokensHelper.isValue({ type: 'COMMA' })).toBeFalsy();
            expect(tokensHelper.isValue({ type: 'ANS' })).toBeTruthy();
            expect(tokensHelper.isValue({ type: 'PI' })).toBeTruthy();
            expect(tokensHelper.isValue({ type: 'NAN' })).toBeTruthy();
            expect(tokensHelper.isValue({ type: 'SQRT' })).toBeFalsy();
        });

        it('ignore inconsistent data', () => {
            expect(tokensHelper.isValue({})).toBeFalsy();
            expect(tokensHelper.isValue()).toBeFalsy();
        });
    });

    describe('isAggregator', () => {
        it('is a function', () => {
            expect(tokensHelper.isAggregator).toEqual(expect.any(Function));
        });

        it('passthrough a type', () => {
            expect(tokensHelper.isAggregator(types.digit)).toBeFalsy();
            expect(tokensHelper.isAggregator(types.operator)).toBeFalsy();
            expect(tokensHelper.isAggregator(types.aggregator)).toBeTruthy();
            expect(tokensHelper.isAggregator(types.separator)).toBeFalsy();
            expect(tokensHelper.isAggregator(types.variable)).toBeFalsy();
            expect(tokensHelper.isAggregator(types.constant)).toBeFalsy();
            expect(tokensHelper.isAggregator(types.term)).toBeFalsy();
            expect(tokensHelper.isAggregator(types.error)).toBeFalsy();
            expect(tokensHelper.isAggregator(types.function)).toBeFalsy();
        });

        it('extracts the type', () => {
            expect(tokensHelper.isAggregator({ type: types.digit })).toBeFalsy();
            expect(tokensHelper.isAggregator({ type: types.operator })).toBeFalsy();
            expect(tokensHelper.isAggregator({ type: types.aggregator })).toBeTruthy();
            expect(tokensHelper.isAggregator({ type: types.separator })).toBeFalsy();
            expect(tokensHelper.isAggregator({ type: types.variable })).toBeFalsy();
            expect(tokensHelper.isAggregator({ type: types.constant })).toBeFalsy();
            expect(tokensHelper.isAggregator({ type: types.term })).toBeFalsy();
            expect(tokensHelper.isAggregator({ type: types.error })).toBeFalsy();
            expect(tokensHelper.isAggregator({ type: types.function })).toBeFalsy();
        });

        it('detects the type', () => {
            expect(tokensHelper.isAggregator({ type: 'NUM0' })).toBeFalsy();
            expect(tokensHelper.isAggregator({ type: 'ADD' })).toBeFalsy();
            expect(tokensHelper.isAggregator({ type: 'LPAR' })).toBeTruthy();
            expect(tokensHelper.isAggregator({ type: 'COMMA' })).toBeFalsy();
            expect(tokensHelper.isAggregator({ type: 'ANS' })).toBeFalsy();
            expect(tokensHelper.isAggregator({ type: 'PI' })).toBeFalsy();
            expect(tokensHelper.isAggregator({ type: 'NAN' })).toBeFalsy();
            expect(tokensHelper.isAggregator({ type: 'SQRT' })).toBeFalsy();
        });

        it('ignore inconsistent data', () => {
            expect(tokensHelper.isAggregator({})).toBeFalsy();
            expect(tokensHelper.isAggregator()).toBeFalsy();
        });
    });

    describe('isError', () => {
        it('is a function', () => {
            expect(tokensHelper.isError).toEqual(expect.any(Function));
        });

        it('passthrough a type', () => {
            expect(tokensHelper.isError(types.digit)).toBeFalsy();
            expect(tokensHelper.isError(types.operator)).toBeFalsy();
            expect(tokensHelper.isError(types.aggregator)).toBeFalsy();
            expect(tokensHelper.isError(types.separator)).toBeFalsy();
            expect(tokensHelper.isError(types.variable)).toBeFalsy();
            expect(tokensHelper.isError(types.constant)).toBeFalsy();
            expect(tokensHelper.isError(types.term)).toBeFalsy();
            expect(tokensHelper.isError(types.error)).toBeTruthy();
            expect(tokensHelper.isError(types.function)).toBeFalsy();
        });

        it('extracts the type', () => {
            expect(tokensHelper.isError({ type: types.digit })).toBeFalsy();
            expect(tokensHelper.isError({ type: types.operator })).toBeFalsy();
            expect(tokensHelper.isError({ type: types.aggregator })).toBeFalsy();
            expect(tokensHelper.isError({ type: types.separator })).toBeFalsy();
            expect(tokensHelper.isError({ type: types.variable })).toBeFalsy();
            expect(tokensHelper.isError({ type: types.constant })).toBeFalsy();
            expect(tokensHelper.isError({ type: types.term })).toBeFalsy();
            expect(tokensHelper.isError({ type: types.error })).toBeTruthy();
            expect(tokensHelper.isError({ type: types.function })).toBeFalsy();
        });

        it('detects the type', () => {
            expect(tokensHelper.isError({ type: 'NUM0' })).toBeFalsy();
            expect(tokensHelper.isError({ type: 'ADD' })).toBeFalsy();
            expect(tokensHelper.isError({ type: 'LPAR' })).toBeFalsy();
            expect(tokensHelper.isError({ type: 'COMMA' })).toBeFalsy();
            expect(tokensHelper.isError({ type: 'ANS' })).toBeFalsy();
            expect(tokensHelper.isError({ type: 'PI' })).toBeFalsy();
            expect(tokensHelper.isError({ type: 'NAN' })).toBeTruthy();
            expect(tokensHelper.isError({ type: 'SQRT' })).toBeFalsy();
        });

        it('ignore inconsistent data', () => {
            expect(tokensHelper.isError({})).toBeFalsy();
            expect(tokensHelper.isError()).toBeFalsy();
        });
    });

    describe('isConstant', () => {
        it('is a function', () => {
            expect(tokensHelper.isConstant).toEqual(expect.any(Function));
        });

        it('passthrough a type', () => {
            expect(tokensHelper.isConstant(types.digit)).toBeFalsy();
            expect(tokensHelper.isConstant(types.operator)).toBeFalsy();
            expect(tokensHelper.isConstant(types.aggregator)).toBeFalsy();
            expect(tokensHelper.isConstant(types.separator)).toBeFalsy();
            expect(tokensHelper.isConstant(types.variable)).toBeFalsy();
            expect(tokensHelper.isConstant(types.constant)).toBeTruthy();
            expect(tokensHelper.isConstant(types.term)).toBeFalsy();
            expect(tokensHelper.isConstant(types.error)).toBeFalsy();
            expect(tokensHelper.isConstant(types.function)).toBeFalsy();
        });

        it('extracts the type', () => {
            expect(tokensHelper.isConstant({ type: types.digit })).toBeFalsy();
            expect(tokensHelper.isConstant({ type: types.operator })).toBeFalsy();
            expect(tokensHelper.isConstant({ type: types.aggregator })).toBeFalsy();
            expect(tokensHelper.isConstant({ type: types.separator })).toBeFalsy();
            expect(tokensHelper.isConstant({ type: types.variable })).toBeFalsy();
            expect(tokensHelper.isConstant({ type: types.constant })).toBeTruthy();
            expect(tokensHelper.isConstant({ type: types.term })).toBeFalsy();
            expect(tokensHelper.isConstant({ type: types.error })).toBeFalsy();
            expect(tokensHelper.isConstant({ type: types.function })).toBeFalsy();
        });

        it('detects the type', () => {
            expect(tokensHelper.isConstant({ type: 'NUM0' })).toBeFalsy();
            expect(tokensHelper.isConstant({ type: 'ADD' })).toBeFalsy();
            expect(tokensHelper.isConstant({ type: 'LPAR' })).toBeFalsy();
            expect(tokensHelper.isConstant({ type: 'COMMA' })).toBeFalsy();
            expect(tokensHelper.isConstant({ type: 'ANS' })).toBeFalsy();
            expect(tokensHelper.isConstant({ type: 'PI' })).toBeTruthy();
            expect(tokensHelper.isConstant({ type: 'NAN' })).toBeFalsy();
            expect(tokensHelper.isConstant({ type: 'SQRT' })).toBeFalsy();
        });

        it('ignore inconsistent data', () => {
            expect(tokensHelper.isConstant({})).toBeFalsy();
            expect(tokensHelper.isConstant()).toBeFalsy();
        });
    });

    describe('isVariable', () => {
        it('is a function', () => {
            expect(tokensHelper.isVariable).toEqual(expect.any(Function));
        });

        it('passthrough a type', () => {
            expect(tokensHelper.isVariable(types.digit)).toBeFalsy();
            expect(tokensHelper.isVariable(types.operator)).toBeFalsy();
            expect(tokensHelper.isVariable(types.aggregator)).toBeFalsy();
            expect(tokensHelper.isVariable(types.separator)).toBeFalsy();
            expect(tokensHelper.isVariable(types.variable)).toBeTruthy();
            expect(tokensHelper.isVariable(types.constant)).toBeFalsy();
            expect(tokensHelper.isVariable(types.term)).toBeTruthy();
            expect(tokensHelper.isVariable(types.error)).toBeFalsy();
            expect(tokensHelper.isVariable(types.function)).toBeFalsy();
        });

        it('extracts the type', () => {
            expect(tokensHelper.isVariable({ type: types.digit })).toBeFalsy();
            expect(tokensHelper.isVariable({ type: types.operator })).toBeFalsy();
            expect(tokensHelper.isVariable({ type: types.aggregator })).toBeFalsy();
            expect(tokensHelper.isVariable({ type: types.separator })).toBeFalsy();
            expect(tokensHelper.isVariable({ type: types.variable })).toBeTruthy();
            expect(tokensHelper.isVariable({ type: types.constant })).toBeFalsy();
            expect(tokensHelper.isVariable({ type: types.term })).toBeTruthy();
            expect(tokensHelper.isVariable({ type: types.error })).toBeFalsy();
            expect(tokensHelper.isVariable({ type: types.function })).toBeFalsy();
        });

        it('detects the type', () => {
            expect(tokensHelper.isVariable({ type: 'NUM0' })).toBeFalsy();
            expect(tokensHelper.isVariable({ type: 'ADD' })).toBeFalsy();
            expect(tokensHelper.isVariable({ type: 'LPAR' })).toBeFalsy();
            expect(tokensHelper.isVariable({ type: 'COMMA' })).toBeFalsy();
            expect(tokensHelper.isVariable({ type: 'ANS' })).toBeTruthy();
            expect(tokensHelper.isVariable({ type: 'PI' })).toBeFalsy();
            expect(tokensHelper.isVariable({ type: 'NAN' })).toBeFalsy();
            expect(tokensHelper.isVariable({ type: 'SQRT' })).toBeFalsy();
        });

        it('ignore inconsistent data', () => {
            expect(tokensHelper.isVariable({})).toBeFalsy();
            expect(tokensHelper.isVariable()).toBeFalsy();
        });
    });

    describe('isFunction', () => {
        it('is a function', () => {
            expect(tokensHelper.isFunction).toEqual(expect.any(Function));
        });

        it('passthrough a type', () => {
            expect(tokensHelper.isFunction(types.digit)).toBeFalsy();
            expect(tokensHelper.isFunction(types.operator)).toBeFalsy();
            expect(tokensHelper.isFunction(types.aggregator)).toBeFalsy();
            expect(tokensHelper.isFunction(types.separator)).toBeFalsy();
            expect(tokensHelper.isFunction(types.variable)).toBeFalsy();
            expect(tokensHelper.isFunction(types.constant)).toBeFalsy();
            expect(tokensHelper.isFunction(types.term)).toBeFalsy();
            expect(tokensHelper.isFunction(types.error)).toBeFalsy();
            expect(tokensHelper.isFunction(types.function)).toBeTruthy();
        });

        it('extracts the type', () => {
            expect(tokensHelper.isFunction({ type: types.digit })).toBeFalsy();
            expect(tokensHelper.isFunction({ type: types.operator })).toBeFalsy();
            expect(tokensHelper.isFunction({ type: types.aggregator })).toBeFalsy();
            expect(tokensHelper.isFunction({ type: types.separator })).toBeFalsy();
            expect(tokensHelper.isFunction({ type: types.variable })).toBeFalsy();
            expect(tokensHelper.isFunction({ type: types.constant })).toBeFalsy();
            expect(tokensHelper.isFunction({ type: types.term })).toBeFalsy();
            expect(tokensHelper.isFunction({ type: types.error })).toBeFalsy();
            expect(tokensHelper.isFunction({ type: types.function })).toBeTruthy();
        });

        it('detects the type', () => {
            expect(tokensHelper.isFunction({ type: 'NUM0' })).toBeFalsy();
            expect(tokensHelper.isFunction({ type: 'ADD' })).toBeFalsy();
            expect(tokensHelper.isFunction({ type: 'LPAR' })).toBeFalsy();
            expect(tokensHelper.isFunction({ type: 'COMMA' })).toBeFalsy();
            expect(tokensHelper.isFunction({ type: 'ANS' })).toBeFalsy();
            expect(tokensHelper.isFunction({ type: 'PI' })).toBeFalsy();
            expect(tokensHelper.isFunction({ type: 'NAN' })).toBeFalsy();
            expect(tokensHelper.isFunction({ type: 'SQRT' })).toBeTruthy();
        });

        it('ignore inconsistent data', () => {
            expect(tokensHelper.isFunction({})).toBeFalsy();
            expect(tokensHelper.isFunction()).toBeFalsy();
        });
    });

    describe('isIdentifier', () => {
        it('is a function', () => {
            expect(tokensHelper.isIdentifier).toEqual(expect.any(Function));
        });

        it('passthrough a type', () => {
            expect(tokensHelper.isIdentifier(types.digit)).toBeFalsy();
            expect(tokensHelper.isIdentifier(types.operator)).toBeFalsy();
            expect(tokensHelper.isIdentifier(types.aggregator)).toBeFalsy();
            expect(tokensHelper.isIdentifier(types.separator)).toBeFalsy();
            expect(tokensHelper.isIdentifier(types.variable)).toBeTruthy();
            expect(tokensHelper.isIdentifier(types.constant)).toBeTruthy();
            expect(tokensHelper.isIdentifier(types.term)).toBeTruthy();
            expect(tokensHelper.isIdentifier(types.error)).toBeTruthy();
            expect(tokensHelper.isIdentifier(types.function)).toBeTruthy();
        });

        it('extracts the type', () => {
            expect(tokensHelper.isIdentifier({ type: types.digit })).toBeFalsy();
            expect(tokensHelper.isIdentifier({ type: types.operator })).toBeFalsy();
            expect(tokensHelper.isIdentifier({ type: types.aggregator })).toBeFalsy();
            expect(tokensHelper.isIdentifier({ type: types.separator })).toBeFalsy();
            expect(tokensHelper.isIdentifier({ type: types.variable })).toBeTruthy();
            expect(tokensHelper.isIdentifier({ type: types.constant })).toBeTruthy();
            expect(tokensHelper.isIdentifier({ type: types.term })).toBeTruthy();
            expect(tokensHelper.isIdentifier({ type: types.error })).toBeTruthy();
            expect(tokensHelper.isIdentifier({ type: types.function })).toBeTruthy();
        });

        it('detects the type', () => {
            expect(tokensHelper.isIdentifier({ type: 'NUM0' })).toBeFalsy();
            expect(tokensHelper.isIdentifier({ type: 'ADD' })).toBeFalsy();
            expect(tokensHelper.isIdentifier({ type: 'LPAR' })).toBeFalsy();
            expect(tokensHelper.isIdentifier({ type: 'COMMA' })).toBeFalsy();
            expect(tokensHelper.isIdentifier({ type: 'ANS' })).toBeTruthy();
            expect(tokensHelper.isIdentifier({ type: 'PI' })).toBeTruthy();
            expect(tokensHelper.isIdentifier({ type: 'NAN' })).toBeTruthy();
            expect(tokensHelper.isIdentifier({ type: 'SQRT' })).toBeTruthy();
        });

        it('ignore inconsistent data', () => {
            expect(tokensHelper.isIdentifier({})).toBeFalsy();
            expect(tokensHelper.isIdentifier()).toBeFalsy();
        });
    });

    describe('isSeparator', () => {
        it('is a function', () => {
            expect(tokensHelper.isSeparator).toEqual(expect.any(Function));
        });

        it('passthrough a type', () => {
            expect(tokensHelper.isSeparator(types.digit)).toBeFalsy();
            expect(tokensHelper.isSeparator(types.operator)).toBeTruthy();
            expect(tokensHelper.isSeparator(types.aggregator)).toBeTruthy();
            expect(tokensHelper.isSeparator(types.separator)).toBeTruthy();
            expect(tokensHelper.isSeparator(types.variable)).toBeFalsy();
            expect(tokensHelper.isSeparator(types.constant)).toBeFalsy();
            expect(tokensHelper.isSeparator(types.term)).toBeFalsy();
            expect(tokensHelper.isSeparator(types.error)).toBeFalsy();
            expect(tokensHelper.isSeparator(types.function)).toBeFalsy();
        });

        it('extracts the type', () => {
            expect(tokensHelper.isSeparator({ type: types.digit })).toBeFalsy();
            expect(tokensHelper.isSeparator({ type: types.operator })).toBeTruthy();
            expect(tokensHelper.isSeparator({ type: types.aggregator })).toBeTruthy();
            expect(tokensHelper.isSeparator({ type: types.separator })).toBeTruthy();
            expect(tokensHelper.isSeparator({ type: types.variable })).toBeFalsy();
            expect(tokensHelper.isSeparator({ type: types.constant })).toBeFalsy();
            expect(tokensHelper.isSeparator({ type: types.term })).toBeFalsy();
            expect(tokensHelper.isSeparator({ type: types.error })).toBeFalsy();
            expect(tokensHelper.isSeparator({ type: types.function })).toBeFalsy();
        });

        it('detects the type', () => {
            expect(tokensHelper.isSeparator({ type: 'NUM0' })).toBeFalsy();
            expect(tokensHelper.isSeparator({ type: 'ADD' })).toBeTruthy();
            expect(tokensHelper.isSeparator({ type: 'LPAR' })).toBeTruthy();
            expect(tokensHelper.isSeparator({ type: 'COMMA' })).toBeTruthy();
            expect(tokensHelper.isSeparator({ type: 'ANS' })).toBeFalsy();
            expect(tokensHelper.isSeparator({ type: 'PI' })).toBeFalsy();
            expect(tokensHelper.isSeparator({ type: 'NAN' })).toBeFalsy();
            expect(tokensHelper.isSeparator({ type: 'SQRT' })).toBeFalsy();
        });

        it('ignore inconsistent data', () => {
            expect(tokensHelper.isSeparator({})).toBeFalsy();
            expect(tokensHelper.isSeparator()).toBeFalsy();
        });
    });

    describe('isModifier', () => {
        it('is a function', () => {
            expect(tokensHelper.isModifier).toEqual(expect.any(Function));
        });

        it('passthrough a type', () => {
            expect(tokensHelper.isModifier(types.digit)).toBeFalsy();
            expect(tokensHelper.isModifier(types.operator)).toBeTruthy();
            expect(tokensHelper.isModifier(types.aggregator)).toBeFalsy();
            expect(tokensHelper.isModifier(types.separator)).toBeFalsy();
            expect(tokensHelper.isModifier(types.variable)).toBeFalsy();
            expect(tokensHelper.isModifier(types.constant)).toBeFalsy();
            expect(tokensHelper.isModifier(types.term)).toBeFalsy();
            expect(tokensHelper.isModifier(types.error)).toBeFalsy();
            expect(tokensHelper.isModifier(types.function)).toBeTruthy();
        });

        it('extracts the type', () => {
            expect(tokensHelper.isModifier({ type: types.digit })).toBeFalsy();
            expect(tokensHelper.isModifier({ type: types.operator })).toBeTruthy();
            expect(tokensHelper.isModifier({ type: types.aggregator })).toBeFalsy();
            expect(tokensHelper.isModifier({ type: types.separator })).toBeFalsy();
            expect(tokensHelper.isModifier({ type: types.variable })).toBeFalsy();
            expect(tokensHelper.isModifier({ type: types.constant })).toBeFalsy();
            expect(tokensHelper.isModifier({ type: types.term })).toBeFalsy();
            expect(tokensHelper.isModifier({ type: types.error })).toBeFalsy();
            expect(tokensHelper.isModifier({ type: types.function })).toBeTruthy();
        });

        it('detects the type', () => {
            expect(tokensHelper.isModifier({ type: 'NUM0' })).toBeFalsy();
            expect(tokensHelper.isModifier({ type: 'ADD' })).toBeTruthy();
            expect(tokensHelper.isModifier({ type: 'LPAR' })).toBeFalsy();
            expect(tokensHelper.isModifier({ type: 'COMMA' })).toBeFalsy();
            expect(tokensHelper.isModifier({ type: 'ANS' })).toBeFalsy();
            expect(tokensHelper.isModifier({ type: 'PI' })).toBeFalsy();
            expect(tokensHelper.isModifier({ type: 'NAN' })).toBeFalsy();
            expect(tokensHelper.isModifier({ type: 'SQRT' })).toBeTruthy();
        });

        it('ignore inconsistent data', () => {
            expect(tokensHelper.isModifier({})).toBeFalsy();
            expect(tokensHelper.isModifier()).toBeFalsy();
        });
    });

    describe('isModifier', () => {
        it('is a function', () => {
            expect(tokensHelper.isModifier).toEqual(expect.any(Function));
        });

        it.each([
            ['Normal expression', '3*4', '3*4'],
            ['Number expression', 42, '42'],
            ['Not a Number', NaN, 'NaN'],
            [
                'Object expression containing value',
                {
                    value: 'cos PI * (40 + 2)'
                },
                'cos PI * (40 + 2)'
            ],
            [
                'Object expression containing result',
                {
                    result: 'cos PI * (40 + 2)'
                },
                'cos PI * (40 + 2)'
            ],
            ['Void object expression', {}, ''],
            ['Null expression', null, ''],
            ['No expression', void 0, ''],
            [
                'Computed expression: 4 @nthrt 45',
                {
                    expression: '4 @nthrt 45',
                    variables: void 0,
                    result: '2.5900200641113514527',
                    value: 2.5900200641113513
                },
                '2.5900200641113513'
            ]
        ])('get a string value from %s', (title, expression, expected) => {
            expect(tokensHelper.stringValue(expression)).toStrictEqual(expected);
        });
    });
});
