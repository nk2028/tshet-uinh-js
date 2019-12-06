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
		in cur.execute('SELECT small_rhyme, of_rhyme, initial, rounding, division FROM full_small_rhymes ORDER BY id;')]
	json.dump(obj, f, ensure_ascii=False, separators=(',',':'))
	f.write('.map(x=>{const a=x.split(\'|\');a[4]=a[4]|0;return a;});')  # 用 | 分隔小韻、韻母、聲母、開合、等，且等為數字
	f.close()

build_small_rhyme()

def build_char_entity():
	f = open('build/char_entity.js', 'w')
	f.write('const char_entities=(()=>{const d=')

	d = defaultdict(list)
	for 字, 小韻, 解釋 in cur.execute('SELECT name, of_small_rhyme, explanation FROM core_char_entities WHERE LENGTH(name) = 1;'):
		d[字].append(str(小韻) + '|' + 解釋)
	d = {k: '+'.join(vs) for k, vs in d.items()}
	json.dump(d, f, ensure_ascii=False, separators=(',',':'))
	f.write(";for(let k in d){d[k]=d[k].split('+').map(e=>e.split('|'));}return d;})();")
	f.close()

build_char_entity()

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

cur.close()
conn.close()
