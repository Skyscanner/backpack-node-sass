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

const cluster = require('cluster');
const fs = require('fs');
const os = require('os');

const fastGlob = require('fast-glob');
const chunk = require('lodash/chunk');
const sass = require('node-sass');
const ora = require('ora');
const { argv } = require('yargs');

const importer = require('./importer');

const getSassFiles = () =>
  fastGlob.sync(
    [
      '**/*.scss',
      '!**/_*.scss',
      '!**/node_modules',
      '!**/bpk-foundations-web/tokens/**',
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
  chunk(files, Math.ceil(files.length / workerCount)).map((filesChunk) => {
    const worker = cluster.fork();

    worker.send(filesChunk);

    return worker;
  });

const getStatusMessage = (files, successes) =>
  `${successes.length}/${files.length} compiled`;

const createWorkers = () => {
  const spinner = ora('Looking for Sass files...').start();
  const files = getSassFiles();

  spinner.succeed(`${files.length} files found`);
  spinner.start(`Spawning workers...`);

  const cpuCount = process.env.CPU_NUMBER || os.cpus().length;
  const workers = getWorkers(files, cpuCount);

  spinner.succeed(`${workers.length} workers spawned`);

  const successes = [];
  const failures = [];

  spinner.start(getStatusMessage(files, successes));

  workers.forEach((worker) => {
    worker.on('message', ({ data, error }) => {
      if (error) {
        failures.push(error);
      } else {
        successes.push(data);
      }

      spinner.text = getStatusMessage(files, successes);
    });

    worker.on('exit', () => {
      if (workers.filter((x) => x.isDead()).length !== workers.length) {
        return;
      }

      if (failures.length) {
        spinner.fail(getStatusMessage(files, successes));
        console.error();
        console.error(`${failures.length} files failed to compile:`);
        console.error();

        failures.forEach((failure) => {
          console.error(failure);
          console.error();
        });

        process.exit(1);
      } else {
        spinner.succeed(getStatusMessage(files, successes));
        process.exit(0);
      }
    });
  });
};

const worker = () =>
  process.on('message', (files) => {
    const promises = files.map(
      (file) =>
        new Promise((resolve, reject) =>
          // eslint-disable-next-line no-promise-executor-return
          sass.render(
            {
              file,
              importer,
              outputStyle: 'compressed',
            },
            (error, result) => {
              if (error) {
                process.send({ error });
                return reject(error);
              }

              const newFile = file.replace('.scss', '.css');

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

              return fs.writeFile(
                newFile,
                prefixedContents || result.css,
                (err) => {
                  if (err) {
                    process.send({ error: err });
                    return reject(err);
                  }

                  process.send({ data: newFile });

                  return resolve();
                },
              );
            },
          ),
        ).catch((error) => ({ error })),
      // The catch clause above prevents the Promise.all fail fast behaviour.
      // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all#Promise.all_fail-fast_behaviour.
    );

    Promise.all(promises)
      .then((values) =>
        cluster.worker.kill(values.some(({ error }) => error) ? 1 : 0),
      )
      .catch(() => {
        // Technically this shouldn't happen, but we'll exit accordingly if it does.
        cluster.worker.kill(1);
      });
  });

if (cluster.isMaster) {
  createWorkers();
} else {
  worker();
}
