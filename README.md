# backpack-node-sass

[![Build Status](https://github.com/Skyscanner/backpack-node-sass/workflows/CI/badge.svg?branch=main)](https://github.com/Skyscanner/backpack-node-sass/actions?query=workflow%3ACI)
[![npm version](https://img.shields.io/npm/v/backpack-node-sass.svg)](https://www.npmjs.com/package/backpack-node-sass)


`backpack-node-sass` runs several `node-sass` processes in parallel - allowing SASS files to be transpiled faster than using `node-sass` directly.

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

Add a comment to output files - e.g. a license header or file comment:

**Note:** Ensure your `prefixComment` is plain text and does not already include comments in the form `/* */`. 

```
> backpack-node-sass --prefixComment="$(<./license.txt)"
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
