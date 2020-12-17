#!/bin/sh

echo 'const Qieyun = (function () {' > index.js

cat build/D_header.js >> index.js
cat output/E_壓縮的字頭資料.js >> index.js
cat output/F_壓縮的小韻資料.js >> index.js
cat output/G_map1.js >> index.js
sed 's/^\(.\)/  \1/' build/H_core.js >> index.js

echo '
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

try { module.exports = exports = Qieyun; } catch (e) { /* continue regardless of error */ }' >> index.js
