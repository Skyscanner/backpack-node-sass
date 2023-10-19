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

const fs = require('fs');
const path = require('path');

const findParentDir = require('find-parent-dir');

function resolve(targetUrl, source) {
  const packageRoot = findParentDir.sync(source, 'node_modules');

  if (!packageRoot) {
    return null;
  }

  const filePath = path.resolve(packageRoot, 'node_modules', targetUrl);
  const isPotentiallyDirectory = !path.extname(filePath);

  if (isPotentiallyDirectory) {
    if (fs.existsSync(`${filePath}.scss`)) {
      return `${filePath}.scss`;
    }

    if (fs.existsSync(filePath)) {
      return path.resolve(filePath, 'index');
    }
  }

  if (fs.existsSync(path.dirname(filePath))) {
    return filePath;
  }

  return resolve(targetUrl, path.dirname(packageRoot));
}

module.exports = function importer(url, prev) {
  return url[0] === '~' ? { file: resolve(url.substr(1), prev) } : null;
};
