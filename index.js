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

const os = require('os');
const fs = require('fs');
const ora = require('ora');
const sass = require('node-sass');
const cluster = require('cluster');
const chunk = require('lodash/chunk');
const fastGlob = require('fast-glob');
const importer = require('node-sass-tilde-importer');
const functions = require('bpk-mixins/sass-functions');

const getSassFiles = () =>
  fastGlob.sync(
    [
      '**/*.scss',
      '!**/_*.scss',
      '!**/node_modules',
      '!**/bpk-tokens/tokens/**',
    ],
    {
      onlyFiles: true,
      followSymlinkedDirectories: false,
      unique: true,
      absolute: true,
    },
  );

const getWorkers = (files, workerCount) =>
  chunk(files, Math.ceil(files.length / workerCount)).map(filesChunk => {
    const worker = cluster.fork();

    worker.send(filesChunk);

    return worker;
  });

const getStatusMessage = (files, successes) =>
  `${successes.length}/${files.length} compiled`;

const master = () => {
  const spinner = ora('Looking for Sass files...').start();
  const files = getSassFiles();

  spinner.succeed(`${files.length} files found`);
  spinner.start(`Spawning workers...`);

  const cpuCount = os.cpus().length;
  const workers = getWorkers(files, cpuCount);

  spinner.succeed(`${workers.length} workers spawned`);

  const successes = [];
  const failures = [];

  spinner.start(getStatusMessage(files, successes));

  workers.forEach(worker =>
    worker.on(
      'message',
      ({ error, data }) =>
        error ? failures.push(error) : successes.push(data),
    ),
  );

  const interval = setInterval(() => {
    spinner.text = getStatusMessage(files, successes);

    if (successes.length + failures.length === files.length) {
      clearInterval(interval);

      if (failures.length) {
        spinner.fail(getStatusMessage(files, successes));
        console.log();
        console.log(`${failures.length} files failed to compile:`);
        console.log();

        failures.forEach(failure => {
          console.log(failure);
          console.log();
        });

        process.exit(1);
      } else {
        spinner.succeed(getStatusMessage(files, successes));
        process.exit(0);
      }
    }
  }, 100);
};

const worker = () =>
  process.on('message', files => {
    const promises = files.map(
      file =>
        new Promise((resolve, reject) =>
          sass.render(
            {
              file,
              importer,
              functions,
              outputStyle: 'compressed',
            },
            (error, result) => {
              if (error) {
                process.send({ error });
                return reject(error);
              }

              const newFile = file.replace('.scss', '.css');

              return fs.writeFile(newFile, result.css, err => {
                if (err) {
                  process.send({ error });
                  return reject(err);
                }

                process.send({ data: newFile });

                return resolve();
              });
            },
          ),
        ),
    );

    Promise.all(promises)
      .then(() => cluster.worker.kill(0))
      .catch(() => cluster.worker.kill(1));
  });

if (cluster.isMaster) {
  master();
} else {
  worker();
}
