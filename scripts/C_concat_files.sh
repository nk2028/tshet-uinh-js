#!/bin/sh

echo '"use strict";
const Qieyun = (function () {' > index.js

cat build/header.js >> index.js
cat output/字頭資料.js >> index.js
cat output/小韻資料.js >> index.js
cat output/map1.js >> index.js
cat build/map.js >> index.js
cat build/unpack_data.js >> index.js
cat build/core.js >> index.js

echo 'return { query漢字: query漢字
, query小韻號: query小韻號
, get上字: get上字
, get下字: get下字
, get反切: get反切
, get音韻地位: get音韻地位
, 音韻地位: 音韻地位
};
})();

try { module.exports = exports = Qieyun; } catch (e) {}' >> index.js
