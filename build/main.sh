#!/bin/sh

curl -LsSo build/字頭表.csv https://raw.githubusercontent.com/nk2028/qieyun-data/7e2aa4a/%E5%AD%97%E9%A0%AD%E8%A1%A8.csv
curl -LsSo build/小韻表.csv https://raw.githubusercontent.com/nk2028/qieyun-data/7e2aa4a/%E5%B0%8F%E9%9F%BB%E8%A1%A8.csv

echo "export default '\\" > src/字頭資料.js
sed '1d;s/,//g;s/$/\\/' build/字頭表.csv >> src/字頭資料.js
echo "';" >> src/字頭資料.js

echo "export default '\\" > src/小韻資料.js
sed '1d;s/,//;s/$/\\/' build/小韻表.csv >> src/小韻資料.js
echo "';" >> src/小韻資料.js
