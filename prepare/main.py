import os
from QieyunEncoder import from描述, to編碼

if not os.path.exists('prepare/data.csv'):
	os.system('curl -LsSo prepare/data.csv https://raw.githubusercontent.com/nk2028/qieyun-data/9ee0dc6/data.csv')

d = {}
特殊反切 = []

with open('prepare/data.csv') as f:
	next(f) # skip header
	for line in f:
		描述, 反切, 字頭, 解釋 = line.rstrip('\n').split(',')

		# patch
		if 反切 in ('姊規', '扶來', '昨閑', '莫亥', '莫代', '乙白'):
			continue # strange 反切, and only corresponds to rare characters
		if 反切 == '去其' and 字頭 == '抾':
			continue # 抾，去其切，又丘之切, but the two fanqie imply the same phonological position

		母, 呼, 等, 重紐, 韻, 聲 = from描述(描述)
		編碼 = to編碼(母, 呼, 等, 重紐, 韻, 聲)

		if 反切 == '':
			反切 = '@@' # placeholder

		res = d.get(編碼)
		if res is None:
			d[編碼] = (反切, [(字頭, 解釋)])
		else:
			原反切, 字頭解釋 = res
			if 反切 != 原反切:
				特殊反切.append((編碼, 字頭, 反切))
			字頭解釋.append((字頭, 解釋))

with open('src/lib/資料.ts', 'w') as f:
	print('export default \'\\', file=f)
	for 編碼, (反切, 字頭解釋) in d.items():
		print(編碼 + 反切 + '|'.join(字頭 + 解釋 for 字頭, 解釋 in 字頭解釋) + '\\', file=f)
	print('\';', file=f)

with open('src/lib/特殊反切.ts', 'w') as f:
	print('export default {', file=f)
	for 編碼, 字頭, 反切 in 特殊反切:
		print("  '%s': '%s'," % (編碼 + 字頭, 反切), file=f)
	print('};', file=f)
