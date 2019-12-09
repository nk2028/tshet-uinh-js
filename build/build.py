#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from collections import defaultdict
import json
import sqlite3
import subprocess

conn = sqlite3.connect('build/data.sqlite3')
cur = conn.cursor()

def build_small_rhyme():
	f = open('build/small_rhyme.js', 'w')
	f.write('const small_rhymes=')
	obj = ['|'.join((小韻, 韻母, 聲母, 開合, str(等))) \
		for 小韻, 韻母, 聲母, 開合, 等 \
		in cur.execute('SELECT 小韻, 韻, 母, 開合, 等 FROM 廣韻小韻全 ORDER BY 小韻號;')]
	json.dump(obj, f, ensure_ascii=False, separators=(',',':'))
	f.write(".map(x=>{const a=x.split('|');a[4]=a[4]|0;return a;});")  # 用 | 分隔小韻、韻母、聲母、開合、等，且等為數字
	f.close()

build_small_rhyme()

def build_char_entity():
	f = open('build/char_entity.js', 'w')
	f.write('const char_entities=(()=>{const d=')

	d = defaultdict(list)
	for 字, 小韻, 解釋 in cur.execute('SELECT 字頭, 小韻號, 解釋 FROM 廣韻字頭 WHERE length(字頭) = 1;'):
		d[字].append(str(小韻) + '|' + 解釋)
	d = {k: '+'.join(vs) for k, vs in d.items()}
	json.dump(d, f, ensure_ascii=False, separators=(',',':'))
	f.write(";for(let k in d){d[k]=d[k].split('+').map(e=>e.split('|'));}return d;})();")
	f.close()

build_char_entity()

cur.close()
conn.close()

def minify_brogue2():
	with open('build/brogue2.min.js', 'w') as fout:
		subprocess.call(['minify', 'build/brogue2.js'], stdout=fout, shell=True)

minify_brogue2()

def concat_files(l, s):
	fout = open(s, 'w')
	for i in l:
		f = open(i)
		fout.write(f.read())
		f.close()
		fout.write('\n')
	fout.close()

concat_files(('build/map.js', 'build/char_entity.js', 'build/small_rhyme.js', 'build/brogue2.min.js'), 'docs/brogue2.js')
