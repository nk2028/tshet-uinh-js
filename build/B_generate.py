import json
import pandas
import sqlite3

conn = sqlite3.connect('cache/qieyun.sqlite3')
cur = conn.cursor()

# 壓縮的小韻資料

母到母id = pandas.read_csv('build/initial_map.csv', dtype=str, na_filter=False)
母到母id_obj = {x: y for x, y in zip(母到母id['Initial'], 母到母id['InitialID'])}

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

with open('output/F_壓縮的小韻資料.js', 'w') as f:
	f.write('const 壓縮的小韻資料 = `')
	f.write('\\\n'.join(''.join((母到母id_obj[母], make開合等重紐(開合, 等, 重紐), 韻, 'xx' if not 反切 else 反切 or '')) \
		for 母, 開合, 等, 韻, 重紐, 反切 \
		in cur.execute('SELECT 母, 開合, 等, 韻, 重紐, 上字 || 下字 FROM 廣韻小韻全 ORDER BY 小韻號;')))
	f.write('`;\n')  # 母, 開合, 等, 韻, 重紐，且等為數字

# 壓縮的字頭資料

with open('output/E_壓縮的字頭資料.js', 'w') as f:
	f.write('const 壓縮的字頭資料 = `')
	f.write('\\\n'.join(''.join((str(小韻號), 字頭, 解釋)) \
		for 小韻號, 字頭, 解釋
		in cur.execute('SELECT 小韻號, 字頭, 解釋 FROM 廣韻字頭 WHERE length(字頭) = 1;')))
	f.write('`;\n')

cur.close()
conn.close()
