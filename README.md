# backpack-node-sass

[![Build Status](https://github.com/Skyscanner/backpack-node-sass/workflows/CI/badge.svg?branch=main)](https://github.com/Skyscanner/backpack-node-sass/actions?query=workflow%3ACI)
[![npm version](https://img.shields.io/npm/v/backpack-node-sass.svg)](https://www.npmjs.com/package/backpack-node-sass)


Parallelised `node-sass` with Backpack support.

## Install

```
npm install --save-dev backpack-node-sass
```

## Usage

```
> backpack-node-sass
✔ 159 files found
✔ 8 workers spawned
✔ 159/159 compiled
```

Add Skyscanner license header to output files - mainly for open source projects:

```
> backpack-node-sass --licenseHeader
✔ 159 files found
✔ 8 workers spawned
✔ 159/159 compiled
```

Watch mode:

```
> backpack-node-sass --watch
✔ Ready for changes
✔ Compiled: packages/bpk-component-button/src/bpk-button.css
✔ Compiled: packages/bpk-component-text/src/BpkText.css
```
