# qieyun-js

[![](https://badge.fury.io/js/qieyun.svg)](https://www.npmjs.com/package/qieyun) [![](https://data.jsdelivr.com/v1/package/npm/qieyun/badge)](https://www.jsdelivr.com/package/npm/qieyun) [![](https://github.com/nk2028/qieyun-js/workflows/Package/badge.svg)](https://github.com/nk2028/qieyun-js/actions?query=workflow%3A%22Package%22)

JavaScript library for the _Qieyun_ phonological system

![](https://nk2028.shn.hk/qieyun-js/demo/qieyun-js.png)

Documentation: [link](https://nk2028.shn.hk/qieyun-js/)

## Usage

Browser:

```html
<script src="https://cdn.jsdelivr.net/npm/qieyun@0.7.4"></script>
```

Node.js:

```sh
$ npm install qieyun
```

```javascript
> const Qieyun = require('qieyun');
```

## Build & Test

### Build

See the [build script](.github/workflows/test.yml).

### Build Documentation

```sh
npm install
npm run docs
```

## Note for developers

You need to substitute all the occurrences of the version string before publishing a new release.
