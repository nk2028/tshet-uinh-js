#!/bin/sh

echo "const Qieyun = (() => {
`sed 's/^\(.\)/  \1/' build/D_header.js`

  `cat output/E_壓縮的字頭資料.js`

  `cat output/F_壓縮的小韻資料.js`

`sed 's/^\(.\)/  \1/' build/G_map.js.txt`

`sed 's/^\(.\)/  \1/' build/H_core.js`

  return {
    query漢字,
    query小韻號,
    get上字,
    get下字,
    get反切,
    get音韻地位,
    音韻地位,
  };
})();

try { module.exports = Qieyun; } catch (e) { /* continue regardless of error */ }" > index.js
