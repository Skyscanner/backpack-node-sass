/*
 * backpack-node-sass
 *
 * Copyright 2018 Skyscanner Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-console */

const fs = require('fs');
const util = require('util');

const chokidar = require('chokidar');
const sass = require('node-sass');
const ora = require('ora');
const { argv } = require('yargs');

const functions = require('@skyscanner/backpack-web/bpk-mixins/sass-functions');

const importer = require('./importer');

const getCssFileName = (name) => name.replace(/\.scss/, '.css');

const renderSass = util.promisify(sass.render);
const writeFile = util.promisify(fs.writeFile);
const unlinkFile = util.promisify(fs.unlink);

const compileSass = async (file, spinner) => {
  const cssFileName = getCssFileName(file);

  try {
    const result = await renderSass({
      file,
      importer,
      functions,
      outputStyle: 'compressed',
    });

    let prefixedContents;

    if (argv.prefixComment) {
      try {
        const comment = `/* 
${argv.prefixComment.replace(/^/gm, ' * ')}
*/`;
        prefixedContents = [comment, result.css].join('\n');
      } catch (err) {
        console.error('There was an error processing the argument.');
        console.error(err);
      }
    }

    await writeFile(cssFileName, prefixedContents || result.css);
    spinner.succeed(`Compiled: ${cssFileName}`);
  } catch (e) {
    spinner.fail(`Failed: ${cssFileName}`);
    console.error();
    console.error(e);
    console.error();
  }
};

const spinner = ora('Starting watcher...').start();

chokidar
  .watch(
    [
      '**/*.scss',
      '!**/_*.scss',
      '!**/node_modules',
      '!**/bpk-foundations-web/tokens/**',
      '!**/bpk-tokens/tokens/**',
    ],
    {
      ignoreInitial: true,
      followSymlinks: false,
    },
  )
  .on('ready', () => spinner.succeed('Ready for changes'))
  .on('add', async (file) => {
    spinner.start(`Added: ${file}`);
    await compileSass(file, spinner);
  })
  .on('change', async (file) => {
    spinner.start(`Changed: ${file}`);
    await compileSass(file, spinner);
  })
  .on('unlink', async (file) => {
    spinner.start(`Removed: ${file}`);
    const cssFileName = getCssFileName(file);

    try {
      await unlinkFile(cssFileName);
      spinner.succeed(`Removed: ${cssFileName}`);
    } catch (e) {
      spinner.fail(`Failed: Unable to cleanup ${cssFileName}`);
      console.error();
      console.error(e);
      console.error();
    }
  });
