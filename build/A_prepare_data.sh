#!/bin/sh
mkdir -p cache
wget -nc -P cache https://github.com/nk2028/qieyun-sqlite/releases/download/20200921/qieyun.sqlite3
wget -nc -P cache https://raw.githubusercontent.com/BYVoid/ytenx/master/ytenx/sync/kyonh/YonhMiuk.txt
wget -nc -P cache https://raw.githubusercontent.com/BYVoid/ytenx/master/ytenx/sync/kyonh/YonhGheh.txt
mkdir -p output
