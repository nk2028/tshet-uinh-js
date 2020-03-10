#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from collections import defaultdict
import json
import os
import pandas
from pathlib import Path
import sqlite3
import sys
import urllib.request

here = os.path.abspath(os.path.dirname(__file__))

Path(os.path.join(here, '../cache')).mkdir(exist_ok=True)
Path(os.path.join(here, '../output')).mkdir(exist_ok=True)

# Prepare files
# Download files to `cache` folder

def download_file_if_not_exist(url, name):
	local_path = os.path.join(here, '../cache', name)
	try:
		if not os.path.exists(local_path):
			sys.stderr.write('Retrieving ' + url + '...\n')
			urllib.request.urlretrieve(url, local_path)
	except Exception as e:
		print(name, e)
		sys.exit(0)

download_file_if_not_exist('https://sgalal.github.io/qieyun-sqlite/data.sqlite3', 'data.sqlite3')
download_file_if_not_exist('https://raw.githubusercontent.com/BYVoid/ytenx/master/ytenx/sync/kyonh/YonhMiuk.txt', 'YonhMiuk.txt')
download_file_if_not_exist('https://raw.githubusercontent.com/BYVoid/ytenx/master/ytenx/sync/kyonh/YonhGheh.txt', 'YonhGheh.txt')
download_file_if_not_exist('https://raw.githubusercontent.com/sgalal/qieyun-sqlite/master/build/subgroup.csv', 'subgroup.csv')

# Make data files
# Writes to `output` folder

conn = sqlite3.connect(os.path.join(here, '../cache/data.sqlite3'))
cur = conn.cursor()

def build_map_1():
	f = open(os.path.join(here, '../output/map1.js'), 'w')

	f.write('var __韻到韻賅上去=')
	韻到韻賅上去 = pandas.read_csv(os.path.join(here, '../cache/subgroup.csv'), na_filter=False)
	韻到韻賅上去_obj = {x: y for x, y in zip(韻到韻賅上去['Rhyme'], 韻到韻賅上去['Subgroup']) if len(x) == 1}
	json.dump(韻到韻賅上去_obj, f, ensure_ascii=False, separators=(',',':'))
	f.write(';\n')

	f.write('var __韻到韻賅上去入=')
	韻到韻賅上去入 = pandas.read_csv(os.path.join(here, '../cache/YonhMiuk.txt'), sep=' ', na_filter=False, usecols=['#韻目', '韻系'])
	韻到韻賅上去入_obj = {x: y for x, y in zip(韻到韻賅上去入['#韻目'], 韻到韻賅上去入['韻系']) if len(x) == 1}
	json.dump(韻到韻賅上去入_obj, f, ensure_ascii=False, separators=(',',':'))
	f.write(';\n')

	f.write('var __韻賅上去入到攝=')
	韻賅上去入到攝 = pandas.read_csv(os.path.join(here, '../cache/YonhGheh.txt'), sep=' ', na_filter=False)
	韻賅上去入到攝_obj = {x: y for x, y in zip(韻賅上去入到攝['#韻系'], 韻賅上去入到攝['攝']) if len(x) == 1}
	json.dump(韻賅上去入到攝_obj, f, ensure_ascii=False, separators=(',',':'))
	f.write(';\n')

	f.write('var __母id到母=')
	母id到母 = pandas.read_csv(os.path.join(here, 'initial_map.csv'), dtype=str, na_filter=False)
	母id到母_obj = {x: y for x, y in zip(母id到母['InitialID'], 母id到母['Initial'])}
	json.dump(母id到母_obj, f, ensure_ascii=False, separators=(',',':'))
	f.write(';\n')

	f.close()

build_map_1()

def build_母到母id():
	母到母id = pandas.read_csv(os.path.join(here, 'initial_map.csv'), dtype=str, na_filter=False)
	母到母id_obj = {x: y for x, y in zip(母到母id['Initial'], 母到母id['InitialID'])}
	return 母到母id_obj

母到母ID_OBJ = build_母到母id()

def make開合等重紐(開合, 等, 重紐):
	if 開合 == '開':
		if 等 == 1: return '0'
		if 等 == 2: return '1'
		if 等 == 3 and 重紐 == 'A': return '2'
		if 等 == 3 and 重紐 == 'B': return '3'
		if 等 == 3: return '4'
		if 等 == 4: return '5'
	if 開合 == '合':
		if 等 == 1: return '6'
		if 等 == 2: return '7'
		if 等 == 3 and 重紐 == 'A': return '8'
		if 等 == 3 and 重紐 == 'B': return '9'
		if 等 == 3: return 'a'
		if 等 == 4: return 'b'

# output/small_rhyme.js

def build_small_rhyme():
	f = open(os.path.join(here, '../output/small_rhyme.js'), 'w')
	f.write('var 小韻資料=\n`')
	f.write('\\\n'.join(''.join((母到母ID_OBJ[母], make開合等重紐(開合, 等, 重紐), 韻, 'xx' if not 反切 else 反切 or '')) \
		for 母, 開合, 等, 韻, 重紐, 反切 \
		in cur.execute('SELECT 母, 開合, 等, 韻, 重紐, 上字 || 下字 FROM 廣韻小韻全 ORDER BY 小韻號;')))
	f.write('`;\n')  # 母, 開合, 等, 韻, 重紐，且等為數字
	f.close()

build_small_rhyme()

# output/char_entity.js

def build_char_entity():
	f = open(os.path.join(here, '../output/char_entity.js'), 'w')
	f.write('var 字頭資料=\n`')
	f.write('\\\n'.join(''.join((str(小韻號), 字頭, 解釋)) \
		for 小韻號, 字頭, 解釋
		in cur.execute('SELECT 小韻號, 字頭, 解釋 FROM 廣韻字頭 WHERE length(字頭) = 1;')))
	f.write('`;\n')
	f.close()

build_char_entity()

cur.close()
conn.close()

# Concatenate all output files

with open(os.path.join(here, '../index.js'), 'w') as fout:
	fout.write('''var Qieyun = (function () {\n''')

	def concat_files(l):
		for i in l:
			with open(i) as f:
				fout.write(f.read())
				fout.write('\n')

	concat_files((os.path.join(here, '../output/map1.js') \
		, os.path.join(here, '../output/char_entity.js') \
		, os.path.join(here, '../output/small_rhyme.js') \
		, os.path.join(here, 'brogue2.js')))

	fout.write('''return { query切韻音系: query切韻音系
, get母: get母
, get開合: get開合
, get等: get等
, get等漢字: get等漢字
, get重紐: get重紐
, get韻: get韻
, get韻賅上去: get韻賅上去
, get韻賅上去入: get韻賅上去入
, get攝: get攝
, get聲: get聲
, get音韻描述: get音韻描述
, get上字: get上字
, get下字: get下字
, get反切: get反切
, equal音韻地位: equal音韻地位
};
})();

try { module.exports = exports = Qieyun; } catch (e) {}
''')
