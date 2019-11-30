#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import sqlite3

conn = sqlite3.connect('build/data.sqlite3')
cur = conn.cursor()

def build_small_rhyme():
	f = open('build/small_rhyme.js', 'w')
	f.write('const small_rhymes=')
	obj = [(小韻, 韻母, 聲母, 開合, 等) \
		for 小韻, 韻母, 聲母, 開合, 等 \
		in cur.execute('''SELECT small_rhyme, of_rhyme,
		initial, rounding, division
		FROM full_small_rhymes
		ORDER BY id;''')]
	json.dump(obj, f, ensure_ascii=False, separators=(',',':'))
	f.write(';')
	f.close()

build_small_rhyme()

def build_char_entity():
	f = open('build/char_entity.js', 'w')
	f.write('const char_entities=')
	obj = {字: [int(i) for i in 小韻.split(',')] \
		for 字, 小韻 \
		in cur.execute('''SELECT name, GROUP_CONCAT(of_small_rhyme)
		FROM core_char_entities
		GROUP BY name
		HAVING LENGTH(name) = 1;''')}
	json.dump(obj, f, ensure_ascii=False, separators=(',',':'))
	f.write(';')
	f.close()

build_char_entity()

def concat_files(l, s):
	fout = open(s, 'w')
	for i in l:
		f = open(i)
		fout.write(f.read())
		f.close()
	fout.close()

concat_files(('build/map.js', 'build/char_entity.js', 'build/small_rhyme.js', 'build/index.js'), 'docs/index.js')

cur.close()
conn.close()
