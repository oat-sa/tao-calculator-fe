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
 * Copyright (c) 2023 Open Assessment Technologies SA ;
 */

import { exponentLeft, exponentRight, subscriptRight, symbols, terms } from 'calculator';

export default [
    // *** ROW 1 ***
    [
        {
            type: 'button',
            style: 'command',
            command: 'degree',
            label: 'Deg',
            size: 2
        },
        {
            type: 'button',
            style: 'command',
            command: 'radian',
            label: 'Rad',
            size: 2
        },
        {
            type: 'button',
            style: 'command',
            command: 'historyUp',
            label: '\u2B06',
            size: 2
        },
        {
            type: 'button',
            style: 'command',
            command: 'historyDown',
            label: '\u2B07',
            size: 2
        },
        {
            type: 'button',
            style: 'command',
            command: 'deleteLeft',
            label: '\u232B',
            size: 2
        },
        {
            type: 'button',
            style: 'command',
            command: 'clear',
            label: 'AC',
            size: 2
        }
    ],
    // *** ROW 2 ***
    [
        {
            type: 'button',
            style: 'function',
            command: 'term',
            parameter: 'SIN',
            label: terms.SIN.label,
            size: 2
        },
        {
            type: 'button',
            style: 'function',
            command: 'term',
            parameter: 'COS',
            label: terms.COS.label,
            size: 2
        },
        {
            type: 'button',
            style: 'function',
            command: 'term',
            parameter: 'TAN',
            label: terms.TAN.label,
            size: 2
        },
        {
            type: 'button',
            style: 'function',
            command: 'term',
            parameter: 'ASIN',
            label: terms.ASIN.label,
            size: 2
        },
        {
            type: 'button',
            style: 'function',
            command: 'term',
            parameter: 'ACOS',
            label: terms.ACOS.label,
            size: 2
        },
        {
            type: 'button',
            style: 'function',
            command: 'term',
            parameter: 'ATAN',
            label: terms.ATAN.label,
            size: 2
        }
    ],
    // *** ROW 3 ***
    [
        {
            type: 'button',
            style: 'function',
            command: 'term',
            parameter: 'PI',
            label: terms.PI.label,
            size: 2
        },
        {
            type: 'button',
            style: 'function',
            command: 'term',
            parameter: 'FAC',
            label: terms.FAC.label,
            size: 2
        },
        {
            type: 'button',
            style: 'function',
            command: 'term',
            parameter: 'POW NUM2',
            label: exponentRight('x', '2'),
            size: 2
        },
        {
            type: 'button',
            style: 'function',
            command: 'term',
            parameter: 'POW NUM3',
            label: exponentRight('x', '3'),
            size: 2
        },
        {
            type: 'button',
            style: 'function',
            command: 'term',
            parameter: 'POW',
            label: exponentRight('x', 'y'),
            size: 2
        },
        {
            type: 'button',
            style: 'function',
            command: 'term',
            parameter: 'POW NEG NUM1',
            label: exponentRight('x', symbols.minusOne),
            size: 2
        }
    ],
    // *** ROW 4 ***
    [
        {
            type: 'button',
            style: 'function',
            command: 'term',
            parameter: 'SQRT',
            label: symbols.squareRoot,
            size: 2
        },
        {
            type: 'button',
            style: 'function',
            command: 'term',
            parameter: 'CBRT',
            label: exponentLeft(symbols.squareRoot, '3'),
            size: 2
        },
        {
            type: 'button',
            style: 'function',
            command: 'term',
            parameter: '@NTHRT',
            label: `${exponentLeft(symbols.squareRoot, 'y')}x`,
            size: 2
        },
        {
            type: 'button',
            style: 'function',
            command: 'term',
            parameter: 'TEN POW',
            label: exponentRight('10', 'x'),
            size: 2
        },
        {
            type: 'button',
            style: 'function',
            command: 'term',
            parameter: 'LOG10',
            label: subscriptRight('log', '10'),
            size: 2
        },
        {
            type: 'button',
            style: 'function',
            command: 'term',
            parameter: 'LN',
            label: 'ln',
            size: 2
        }
    ],
    // *** ROW 5 ***
    [
        {
            type: 'button',
            style: 'function',
            command: 'term',
            parameter: 'EXP',
            label: exponentRight(symbols.euler, 'x'),
            size: 2
        },
        {
            type: 'button',
            style: 'function',
            command: 'term',
            parameter: 'E',
            label: symbols.euler,
            size: 2
        },
        {
            type: 'button',
            style: 'function',
            command: 'sign',
            label: '&plusmn;',
            size: 2
        },
        {
            type: 'button',
            style: 'function',
            command: 'term',
            parameter: 'PERCENT',
            label: '%',
            size: 2
        },
        {
            type: 'button',
            style: 'function',
            command: 'term',
            parameter: 'LPAR',
            label: '(',
            size: 2
        },
        {
            type: 'button',
            style: 'function',
            command: 'term',
            parameter: 'RPAR',
            label: ')',
            size: 2
        }
    ],
    // *** ROW 6 ***
    [
        {
            type: 'button',
            style: 'command',
            command: 'memorize',
            label: 'MR',
            size: 2
        },
        {
            type: 'button',
            style: 'command',
            command: 'forget',
            label: 'MC',
            size: 2
        },
        {
            type: 'button',
            style: 'command',
            command: 'remind',
            label: 'Mem',
            size: 2
        },
        {
            type: 'button',
            style: 'command',
            command: 'var',
            parameter: 'ans',
            label: 'ANS',
            size: 3
        },
        {
            type: 'button',
            style: 'operator',
            command: 'term',
            parameter: 'DIV',
            label: symbols.divide,
            size: 3
        }
    ],
    // *** ROW 7 ***
    [
        {
            type: 'button',
            style: 'digit',
            command: 'term',
            parameter: 'NUM7',
            label: '7',
            size: 3
        },
        {
            type: 'button',
            style: 'digit',
            command: 'term',
            parameter: 'NUM8',
            label: '8',
            size: 3
        },
        {
            type: 'button',
            style: 'digit',
            command: 'term',
            parameter: 'NUM9',
            label: '9',
            size: 3
        },
        {
            type: 'button',
            style: 'operator',
            command: 'term',
            parameter: 'MUL',
            label: symbols.multiply,
            size: 3
        }
    ],
    // *** ROW 8 ***
    [
        {
            type: 'button',
            style: 'digit',
            command: 'term',
            parameter: 'NUM4',
            label: '4',
            size: 3
        },
        {
            type: 'button',
            style: 'digit',
            command: 'term',
            parameter: 'NUM5',
            label: '5',
            size: 3
        },
        {
            type: 'button',
            style: 'digit',
            command: 'term',
            parameter: 'NUM6',
            label: '6',
            size: 3
        },
        {
            type: 'button',
            style: 'operator',
            command: 'term',
            parameter: 'SUB',
            label: symbols.minus,
            size: 3
        }
    ],
    // *** ROW 9 ***
    [
        {
            type: 'button',
            style: 'digit',
            command: 'term',
            parameter: 'NUM1',
            label: '1',
            size: 3
        },
        {
            type: 'button',
            style: 'digit',
            command: 'term',
            parameter: 'NUM2',
            label: '2',
            size: 3
        },
        {
            type: 'button',
            style: 'digit',
            command: 'term',
            parameter: 'NUM3',
            label: '3',
            size: 3
        },
        {
            type: 'button',
            style: 'operator',
            command: 'term',
            parameter: 'ADD',
            label: symbols.plus,
            size: 3
        }
    ],
    // *** ROW 10 ***
    [
        {
            type: 'button',
            style: 'digit',
            command: 'term',
            parameter: 'NUM0',
            label: '0',
            size: 3
        },
        {
            type: 'button',
            style: 'digit',
            command: 'term',
            parameter: 'DOT',
            label: '.',
            size: 3
        },
        {
            type: 'button',
            style: 'operator',
            command: 'execute',
            label: '=',
            size: 6
        }
    ]
];
