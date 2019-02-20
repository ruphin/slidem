import filesize from 'rollup-plugin-filesize';
import cleanup from 'rollup-plugin-cleanup';
import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';
import includePaths from 'rollup-plugin-includepaths';
import * as path from 'path';

const license = min =>
  min
    ? ''
    : `/**
 * @license
 * MIT License
 *
 * Copyright (c) 2018 Goffert van Gool
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
`;

const includePathOptions = {
  paths: ['node_modules/slidem', '.'],
  extensions: ['.js']
};

const globals = {};
globals[path.resolve('../@gluon/gluon/gluon.js')] = 'GluonJS';
globals[path.resolve('node_modules/@gluon/gluon/gluon.js')] = 'GluonJS';

function getConfig({ input, dest, format, minified = true, transpiled = false, bundled = false }) {
  const conf = {
    input: input,
    output: { banner: license(minified), file: dest, name: 'slidem', format, sourcemap: !minified, globals },
    external: [!bundled && path.resolve('node_modules/@gluon/gluon/gluon.js')].filter(Boolean),
    plugins: [
      includePaths(includePathOptions),
      transpiled &&
        babel({
          presets: [['@babel/preset-env', { modules: false }]]
        }),
      // Remove duplicate license
      !minified &&
        cleanup({
          maxEmptyLines: 1,
          comments: [/^((?!\(c\) \d{4} Goffert)[\s\S])*$/]
        }),
      minified && terser({ warnings: true, mangle: { module: true }, output: { preamble: license(minified) } }),
      filesize()
    ].filter(Boolean)
  };

  return conf;
}

const demo = {
  input: 'demo/index.js',
  output: { file: 'demo/index.es5.js', format: 'iife', sourcemap: false },
  plugins: [
    includePaths(includePathOptions),
    babel({
      presets: [['@babel/preset-env', { modules: false }]]
    }),
    terser({ warnings: true, mangle: { properties: false, keep_fnames: true, module: true } }),
    filesize()
  ].filter(Boolean)
};

const config = [
  getConfig({ input: './src/slidem-deck.js', dest: 'slidem-deck.umd.js', format: 'umd' }),
  getConfig({ input: './src/slidem-slide-base.js', dest: 'slidem-slide-base.umd.js', format: 'umd' }),
  getConfig({ input: './src/slidem-slide.js', dest: 'slidem-slide.umd.js', format: 'umd' }),
  getConfig({ input: './src/slidem-video-slide.js', dest: 'slidem-video-slide.umd.js', format: 'umd' }),
  getConfig({ input: './src/slidem-polymersummit-slide.js', dest: 'slidem-polymersummit-slide.umd.js', format: 'umd' }),
  demo
];

export default config;
