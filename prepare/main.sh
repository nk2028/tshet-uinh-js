#!/bin/sh

curl -LsSo prepare/字頭表.csv https://raw.githubusercontent.com/nk2028/qieyun-data/7e2aa4a/%E5%AD%97%E9%A0%AD%E8%A1%A8.csv
curl -LsSo prepare/小韻表.csv https://raw.githubusercontent.com/nk2028/qieyun-data/7e2aa4a/%E5%B0%8F%E9%9F%BB%E8%A1%A8.csv

echo "export default '\\" > src/lib/字頭資料.ts
sed '1d;s/,//g;s/$/\\/' prepare/字頭表.csv >> src/lib/字頭資料.ts
echo "';" >> src/lib/字頭資料.ts

echo "export default '\\" > src/lib/小韻資料.ts
sed '1d;s/,//;s/$/\\/' prepare/小韻表.csv >> src/lib/小韻資料.ts
echo "';" >> src/lib/小韻資料.ts
