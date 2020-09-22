# qieyun-js [![](https://github.com/nk2028/qieyun-js/workflows/Node.js%20Package/badge.svg)](https://github.com/nk2028/qieyun-js/actions?query=workflow%3A%22Node.js+Package%22) [![](https://data.jsdelivr.com/v1/package/npm/qieyun/badge)](https://www.jsdelivr.com/package/npm/qieyun)

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

```sh
pip install -r requirements.txt
build/A_prepare_data.sh
python build/B_generate_map1.py
build/C_concat_files.sh
```

### Test

```sh
npm install
npm test
```

### Build Documentation

```sh
npm install
npm run docs
```

## License

Dictionary data is in the public domain.

Source code is distributed under MIT license.
