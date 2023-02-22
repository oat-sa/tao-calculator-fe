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
 * Copyright (c) 2023 (original work) Open Assessment Technologies SA ;
 */

import path from 'path';
import { fileURLToPath } from 'url';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import css from 'rollup-plugin-import-css';
import livereload from 'rollup-plugin-livereload';
import svelte from 'rollup-plugin-svelte';
import preprocess from 'svelte-preprocess';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    input: path.join(__dirname, 'app.js'),
    output: [
        {
            name: 'calculator',
            format: 'es',
            file: path.join(__dirname, 'dist', 'app.js'),
            sourcemap: true
        }
    ],
    watch: {
        clearScreen: false
    },
    preserveEntrySignatures: false,
    plugins: [
        alias({
            resolve: ['.js', '.json', '.css'],
            entries: {
                src: path.join(__dirname, '..', 'src')
            }
        }),
        commonjs(),
        nodeResolve({
            mainFields: ['svelte', 'module', 'main', 'browser'],
            extensions: ['.svelte', '.js', '.css'],
            dedupe: ['svelte']
        }),
        svelte({
            preprocess
        }),
        css(),
        livereload()
    ]
};
