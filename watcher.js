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
const ora = require('ora');
const sass = require('node-sass');
const chokidar = require('chokidar');
const importer = require('node-sass-tilde-importer');
const functions = require('bpk-mixins/sass-functions.js');

const getCssFileName = name => name.replace(/\.scss/, '.css');

const compileSass = file =>
  new Promise((resolve, reject) => {
    sass.render(
      {
        file,
        importer,
        functions,
        outputStyle: 'compressed',
      },
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(result);
      },
    );
  });

const writeFile = (file, data) =>
  new Promise((resolve, reject) => {
    fs.writeFile(file, data, err => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });

const unlinkFile = file =>
  new Promise((resolve, reject) => {
    fs.unlink(file, (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(result);
    });
  });

const spinner = ora('Starting watcher...').start();

chokidar
  .watch(
    [
      '**/*.scss',
      '!**/_*.scss',
      '!**/node_modules',
      '!**/bpk-tokens/tokens/**',
    ],
    {
      ignoreInitial: true,
      followSymlinks: false,
    },
  )
  .on('ready', () => spinner.succeed('Ready for changes'))
  .on('add', async file => {
    spinner.start(`Added: ${file}`);
    const cssFileName = getCssFileName(file);

    try {
      const result = await compileSass(file);
      await writeFile(cssFileName, result.css);
      spinner.succeed(`Compiled: ${cssFileName}`);
    } catch (e) {
      spinner.fail(`Failed: ${cssFileName}`);
      console.error();
      console.error(e);
      console.error();
    }
  })
  .on('change', async file => {
    spinner.start(`Changed: ${file}`);
    const cssFileName = getCssFileName(file);

    try {
      const result = await compileSass(file);
      await writeFile(cssFileName, result.css);
      spinner.succeed(`Compiled: ${cssFileName}`);
    } catch (e) {
      spinner.fail(`Failed: ${cssFileName}`);
      console.error();
      console.error(e);
      console.error();
    }
  })
  .on('unlink', async file => {
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
