# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
## Unreleased

- Added importer.js to package files

## 1.1.0

- Remove dependency of backpack to break cycle dependency
- Remove usage of sassFunctions as this is no longer needed after release of Backpack v31

## 1.0.0

**Breaking:**
- Support Node 18, drop support for older versions.
- Upgrade dependencies
  - `bpk-mixins` to the latest
  - `node-sass` to the latest
- Migrate away from old `node-sass-tilde-importer` as its outdated to a local version.

## 0.9.0

- Updated `bpk-mixins` to latest.

## 0.8.0

- Updated `bpk-mixins` to the latest.
- Updated `node-sass` from v5 to v7. To add support for Node 16.
- Patched other dependencies.

## 0.7.1

### Patched

- Updated `bpk-mixins` to the latest version.
## 0.7.0
### Added

 - Added support for environment variable `CPU_NUMBER` which will override the number of workers spawned.

## 0.6.0
### Patched

- Added support for the Backpack Foundations packages for using node-sass.

## 0.5.0
### Added

- New option `--prefixComment` to allow the ability to add comments at the top of outputted CSS files.

### Patched

- Migrated to `main` branch
- Upgrade `bpk-mixins` to `20.1.18`
- Upgrade `chokidar` to `3.5.1`
- Upgrade `fast-glob` to `3.2.5`
- Upgrade `node-sass` to `5.0.0`
- Upgrade `ora` to `5.3.0`
- Upgrade `yargs` to `16.2.0`
- Upgrade `eslint-config-skyscanner` to `8.1.0`

## 0.4.2 - 2020-09-11
### Fixed
- Upgraded `lodash`

## 0.4.1 - 2020-06-10
### Fixed
- Upgraded `bpk-mixins`

## 0.4.0 - 2019-11-29
### Fixed
- Upgraded node to `lts/erbium` by default
- Upgrade `fast-glob` to `3.0.0`.
- Upgrade `bpk-mixins` to `19.0.18`
- Upgrade `node-sass` to `4.12.0`

## 0.3.2 - 2019-02-14
### Fixed
- Upgrade bpk-mixins, yargs, chokidar and ora.

## 0.3.1 - 2019-02-05
### Fixed
- Upgrade dependencies.

## 0.3.0 - 2018-12-19
### Fixed
- Upgrade node-sass, bpk-mixins, yargs & fast-glob.

## 0.2.1 - 2018-10-11
### Fixed
- Fix cli.

## 0.2.0 - 2018-10-11
### Added
- `--watch` functionality.

## 0.1.3 - 2018-10-09
### Fixed
- Improve exit logic. This prevents the process from hanging when workers exit early.

## 0.1.2 - 2018-10-08
### Fixed
- Improve error handling.

## 0.1.1 - 2018-10-04
### Fixed
- Fix cli.

## 0.1.0 - 2018-10-04
### Added
- Introduce backpack-node-sass.
