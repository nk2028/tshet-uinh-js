import csv
import os
import re
import sys
# import QieyunEncoder

# NOTE QieyunEncoder 也需要大量工作以支持放寬了的音韻地位，在其準備好之前暫時造下輪子 XD

編碼表 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$_'

所有母 = '幫滂並明端透定泥來知徹澄孃精清從心邪莊初崇生俟章昌常書船日見溪羣疑影曉匣云以'
所有呼 = '開合'
所有等 = '一二三四'
所有重紐 = 'AB'
所有韻 = '東冬鍾江支脂之微魚虞模齊祭泰佳皆夬灰咍廢真臻文殷元魂痕寒刪山先仙蕭宵肴豪歌麻陽唐庚耕清青蒸登尤侯幽侵覃談鹽添咸銜嚴凡'
所有聲 = '平上去入'
韻順序表 = '東_冬鍾江支脂之微魚虞模齊祭泰佳皆夬灰咍廢真臻文殷元魂痕寒刪山先仙蕭宵肴豪歌_麻_陽唐庚_耕清青蒸登尤侯幽侵覃談鹽添咸銜嚴凡'

PATTERN_描述 = re.compile(f'([{所有母}])([開合])?([{所有等}])([AB])?([{所有韻}])([{所有聲}])')


def 描述2編碼(描述: str) -> str:
    母, 呼, 等, 重紐, 韻, 聲 = PATTERN_描述.fullmatch(描述).groups()
    # 資料均為可信任來源，且均為完整描述，省略驗證與填充

    母編碼 = 所有母.index(母)
    韻編碼 = {'東三': 1, '歌三': 38, '麻三': 40, '庚三': 44}.get(f'{韻}{等}')
    if 韻編碼 is None:
        韻編碼 = 韻順序表.index(韻)

    呼編碼 = 所有呼.index(呼) + 1 if 呼 else 0
    重紐編碼 = 所有重紐.index(重紐) + 1 if 重紐 else 0

    其他編碼 = (呼編碼 << 4) | (重紐編碼 << 2) | 所有聲.index(聲)

    return 編碼表[母編碼] + 編碼表[韻編碼] + 編碼表[其他編碼]


def fetch_data():
    if not os.path.exists('prepare/data.csv'):
        status = os.system(
            'curl -LsSo prepare/data.csv https://raw.githubusercontent.com/nk2028/qieyun-data/a37876c/%E9%9F%BB%E6%9B%B8/%E5%BB%A3%E9%9F%BB.csv')
        assert status == 0


# debug 用
def list_地位編碼():
    fetch_data()
    all_codes = {}
    with open('prepare/data.csv') as fin:
        for row in csv.DictReader(fin):
            描述 = row['描述']
            if 描述 == '' or 描述 in all_codes:
                continue
            編碼 = 描述2編碼(描述)
            all_codes[描述] = 編碼
    with open('prepare/test.txt', 'w', newline='') as fout:
        for 描述, 編碼 in all_codes.items():
            print(描述, 編碼, file=fout)


def main():
    fetch_data()

    d = {}
    with open('prepare/data.csv') as fin:
        next(fin)
        for row in csv.reader(fin):
            _, _, 韻目原貌, 描述, 反切覈校前, 反切, 字頭覈校前, 字頭, 釋義, 釋義補充, _ = row
            if 描述 == '':
                continue
            反切 = 反切 or 反切覈校前 or '@@'  # placeholder
            字頭 = 字頭 or 字頭覈校前
            釋義 = 釋義 if not 釋義補充 else f'{釋義}（{釋義補充}）'
            編碼 = 描述2編碼(描述)
            d.setdefault(編碼 + 反切, []).append((字頭, 韻目原貌, 釋義))

    os.makedirs('src/data', exist_ok=True)
    with open('src/data/資料.ts', 'w', newline='') as fout:
        print("export default '\\", file=fout)
        for 編碼反切, 條目 in d.items():
            print(編碼反切,
                  '|'.join(字頭 + 韻目原貌 + 釋義 for 字頭, 韻目原貌, 釋義 in 條目),
                  '\\', sep='', file=fout)
        print("';", file=fout)


if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'test':
        list_地位編碼()
    else:
        main()
