# qieyun-js [![](https://data.jsdelivr.com/v1/package/npm/qieyun/badge)](https://www.jsdelivr.com/package/npm/qieyun)

JavaScript library for the Qieyun phonological system

[Documentation](https://nk2028.shn.hk/qieyun-js/)

## Usage

Browser:

```html
<script src="https://cdn.jsdelivr.net/npm/qieyun@0.7.3"></script>
```

Node.js:

```sh
$ npm install qieyun
```

```javascript
> const Qieyun = require('qieyun');
```

![](https://nk2028.shn.hk/qieyun-js/demo/qieyun-js.png)

## Build & Test

### Build

```sh
pip install -r requirements.txt
scripts/A_prepare_data.sh
python scripts/B_create_map.py
scripts/C_concat_files.sh
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
