#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from collections import defaultdict
import json
import os
import pandas
import sqlite3
import subprocess
import sys
import urllib

def download_file_if_not_exist(url, name):
	local_name = 'build/' + name
	try:
		if not os.path.exists(local_name):
			sys.stdout.write('Retrieving ' + url + '...\n')
			urllib.request.urlretrieve(url, local_name)
	except urllib.error.HTTPError as e:
		print(name, e)
		sys.exit(0)

download_file_if_not_exist('https://sgalal.github.io/qieyun-sqlite/data.sqlite3', 'data.sqlite3')
download_file_if_not_exist('https://raw.githubusercontent.com/BYVoid/ytenx/master/ytenx/sync/kyonh/YonhMiuk.txt', 'YonhMiuk.txt')
download_file_if_not_exist('https://raw.githubusercontent.com/BYVoid/ytenx/master/ytenx/sync/kyonh/YonhGheh.txt', 'YonhGheh.txt')
download_file_if_not_exist('https://raw.githubusercontent.com/sgalal/qieyun-sqlite/master/build/subgroup.csv', 'subgroup.csv')

conn = sqlite3.connect('build/data.sqlite3')
cur = conn.cursor()

def build_map_1():
	f = open('build/map1.js', 'w')

	f.write('var __韻到韻賅上去=')
	韻到韻賅上去 = pandas.read_csv('build/subgroup.csv', na_filter=False)
	韻到韻賅上去_obj = {x: y for x, y in zip(韻到韻賅上去['Rhyme'], 韻到韻賅上去['Subgroup']) if len(x) == 1}
	json.dump(韻到韻賅上去_obj, f, ensure_ascii=False, separators=(',',':'))
	f.write(';\n')

	f.write('var __韻到韻賅上去入=')
	韻到韻賅上去入 = pandas.read_csv('build/YonhMiuk.txt', sep=' ', na_filter=False, usecols=['#韻目', '韻系'])
	韻到韻賅上去入_obj = {x: y for x, y in zip(韻到韻賅上去入['#韻目'], 韻到韻賅上去入['韻系']) if len(x) == 1}
	json.dump(韻到韻賅上去入_obj, f, ensure_ascii=False, separators=(',',':'))
	f.write(';\n')

	f.write('var __韻賅上去入到攝=')
	韻賅上去入到攝 = pandas.read_csv('build/YonhGheh.txt', sep=' ', na_filter=False)
	韻賅上去入到攝_obj = {x: y for x, y in zip(韻賅上去入到攝['#韻系'], 韻賅上去入到攝['攝']) if len(x) == 1}
	json.dump(韻賅上去入到攝_obj, f, ensure_ascii=False, separators=(',',':'))
	f.write(';\n')

	f.write('var __母id到母=')
	母id到母 = pandas.read_csv('build/initial_map.csv', dtype=str, na_filter=False)
	母id到母_obj = {x: y for x, y in zip(母id到母['InitialID'], 母id到母['Initial'])}
	json.dump(母id到母_obj, f, ensure_ascii=False, separators=(',',':'))
	f.write(';\n')

	f.close()

build_map_1()

def build_母到母id():
	母到母id = pandas.read_csv('build/initial_map.csv', dtype=str, na_filter=False)
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

def build_small_rhyme():
	f = open('build/small_rhyme.js', 'w')
	f.write('const small_rhymes=__process_small_rhyme("')
	f.write(''.join(''.join((母到母ID_OBJ[母], make開合等重紐(開合, 等, 重紐), 韻, 'xx' if not 反切 else 反切 or '')) \
		for 母, 開合, 等, 韻, 重紐, 反切 \
		in cur.execute('SELECT 母, 開合, 等, 韻, 重紐, 上字 || 下字 FROM 廣韻小韻全 ORDER BY 小韻號;')))
	f.write('");\n')  # 母, 開合, 等, 韻, 重紐，且等為數字
	f.close()

build_small_rhyme()

def build_char_entity():
	f = open('build/char_entity.js', 'w')
	f.write('const char_entities=__process_char_entities("')
	f.write(''.join(''.join((str(小韻號), 字頭, 解釋)) \
		for 小韻號, 字頭, 解釋
		in cur.execute('SELECT 小韻號, 字頭, 解釋 FROM 廣韻字頭 WHERE length(字頭) = 1;')))
	f.write('");\n')
	f.close()

build_char_entity()

cur.close()
conn.close()

def minify_brogue2():
	with open('build/brogue2.js') as fin, open('build/brogue2.min.js', 'w') as fout:
		subprocess.call(['minify', '--js'], stdin=fin, stdout=fout)

minify_brogue2()

def concat_files(l, s):
	fout = open(s, 'w')
	for i in l:
		f = open(i)
		fout.write(f.read())
		f.close()
		fout.write('\n')
	fout.close()

concat_files(('build/map1.js', 'build/char_entity.js', 'build/small_rhyme.js', 'build/brogue2.min.js'), 'qieyun.js')
