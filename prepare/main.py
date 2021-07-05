import os
import QieyunEncoder

if not os.path.exists('prepare/data.csv'):
	os.system('curl -LsSo prepare/data.csv https://raw.githubusercontent.com/nk2028/qieyun-data/9675d03/%E9%9F%BB%E6%9B%B8/%E5%BB%A3%E9%9F%BB.csv')

d = {}
特殊反切 = []

with open('prepare/data.csv') as f:
	next(f) # skip header
	for line in f:
		_, _, 最簡描述, 反切覈校前, 反切, 字頭覈校前, 字頭, 釋義, 釋義補充, _ = line.rstrip('\n').split(',')

		反切 = 反切 or 反切覈校前
		字頭 = 字頭 or 字頭覈校前
		釋義 = 釋義 if not 釋義補充 else f'{釋義}（{釋義補充}）'

		# patch
		if 反切 in ('姊規', '扶來', '昨閑', '莫亥', '莫代', '乙白'):
			continue # strange 反切, and only corresponds to rare characters
		if 反切 == '去其' and 字頭 == '抾':
			continue # 抾，去其切，又丘之切, but the two fanqie imply the same phonological position

		編碼 = QieyunEncoder.音韻地位.from描述(最簡描述).編碼

		if 反切 == '':
			反切 = '@@' # placeholder

		res = d.get(編碼)
		if res is None:
			d[編碼] = (反切, [(字頭, 釋義)])
		else:
			原反切, 字頭釋義 = res
			if 反切 != 原反切:
				特殊反切.append((編碼, 字頭, 反切))
			字頭釋義.append((字頭, 釋義))

with open('src/lib/資料.ts', 'w') as f:
	print('export default \'\\', file=f)
	for 編碼, (反切, 字頭釋義) in d.items():
		print(編碼 + 反切 + '|'.join(字頭 + 釋義 for 字頭, 釋義 in 字頭釋義) + '\\', file=f)
	print('\';', file=f)

with open('src/lib/特殊反切.ts', 'w') as f:
	print('export default {', file=f)
	for 編碼, 字頭, 反切 in 特殊反切:
		print("  '%s': '%s'," % (編碼 + 字頭, 反切), file=f)
	print('};', file=f)
