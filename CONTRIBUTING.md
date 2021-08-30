# Contributing to backpack-node-sass

We're glad you want to make a contribution!

Fork this repository and send in a pull request when you're finished with your changes. Link any relevant issues in too.

Take note of the build status of your pull request, only builds that pass will be accepted. Please also keep to our conventions and style so we can keep this repository as clean as possible.

## License

By contributing your code, you agree to license your contribution under the terms of the [APLv2](./LICENSE).

All files are released with the Apache 2.0 license.

If you are adding a new file it should have a header like this:

```
/**
 * Copyright 2019 Skyscanner Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
```

## Testing

To test, run `npm test`.

## Publishing

This package can be published by members of the Koala team.
To do this:

 - Add a title with the new version for changes in the `UNRELEASED` section of `CHANGELOG.md`.
 - Change the version in `package.json` to reflect the new version.
 - Commit the changes to `package.json` and `CHANGELOG.md`.
 - Run `npm publish`.
 - Run `git tag v<NEW_VERSION>`. For example, `git tag v0.1.0`.
 - Run `git push`.
 - Run `git push --tags`.

