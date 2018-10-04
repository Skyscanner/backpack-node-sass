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

const os = require('os');
const fs = require('fs');
const ora = require('ora');
const sass = require('node-sass');
const cluster = require('cluster');
const chunk = require('lodash/chunk');
const fastGlob = require('fast-glob');
const importer = require('node-sass-tilde-importer');
const functions = require('bpk-mixins/sass-functions');

const master = () => {
  const numCPUs = os.cpus().length;

  const spinner = ora('Looking for Sass files...').start();

  const files = fastGlob.sync(
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

  spinner.succeed(`${files.length} files found`);
  spinner.start(`Spawning workers...`);

  const workers = chunk(files, Math.ceil(files.length / numCPUs)).map(
    filesChunk => {
      const worker = cluster.fork();

      worker.send(filesChunk);

      return worker;
    },
  );

  spinner.succeed(`${workers.length} workers spawned`);

  let count = 0;
  spinner.start(`${count}/${files.length} compiled`);

  workers.forEach(worker =>
    worker.on('message', () => {
      count += 1;
    }),
  );

  const interval = setInterval(() => {
    spinner.text = `${count}/${files.length} compiled`;
    if (count === files.length) {
      spinner.succeed(`${count}/${files.length} compiled`);
      clearInterval(interval);
    }
  }, 100);
};

const worker = () => {
  const compileSass = files => {
    const promises = files.map(
      file =>
        new Promise((resolve, reject) => {
          sass.render(
            {
              file,
              importer,
              functions,
              outputStyle: 'compressed',
            },
            (error, result) => {
              if (error) reject(error);

              const newFile = file.replace('.scss', '.css');

              fs.writeFile(newFile, result.css, err => {
                if (err) reject(err);

                process.send(newFile);

                resolve();
              });
            },
          );
        }),
    );

    Promise.all(promises).then(() => cluster.worker.kill(0));
  };

  process.on('message', compileSass);
};

if (cluster.isMaster) {
  master();
} else {
  worker();
}
