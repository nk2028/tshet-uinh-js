import csv
import os
import re
import sys
# import QieyunEncoder

# NOTE QieyunEncoder 也需要大量工作以支持放寬了的音韻地位，在其準備好之前暫時造下輪子 XD

編碼表 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$_'

所有母 = '幫滂並明端透定泥來知徹澄孃精清從心邪莊初崇生俟章昌常書船日見溪羣疑影曉匣云以'
所有等 = '一二三四'
所有韻 = '東冬鍾江支脂之微魚虞模齊祭泰佳皆夬灰咍廢眞臻文欣元魂痕寒刪山仙先蕭宵肴豪歌麻陽唐庚耕清青蒸登尤侯幽侵覃談鹽添咸銜嚴凡'
所有聲 = '平上去入'
韻順序表 = '東_冬鍾江支脂之微魚虞模齊祭泰佳皆夬灰咍廢眞臻文欣元魂痕寒刪山仙先蕭宵肴豪歌_麻_陽唐庚_耕清青蒸登尤侯幽侵覃談鹽添咸銜嚴凡'

脣音母 = set('幫滂並明')
開合中立韻 = set('東冬鍾江虞模尤幽')
重紐母 = set('幫滂並明見溪羣疑影曉匣')
v1重紐韻 = set('支脂祭眞仙宵侵鹽清')
韻到呼 = {
    '開': set('咍痕欣嚴之魚臻蕭宵肴豪侯侵覃談鹽添咸銜'),
    '合': set('灰魂文凡'),
}
韻到等 = {
    '一': set('冬模泰咍灰痕魂寒豪唐登侯覃談'),
    '二': set('江佳皆夬刪山肴耕咸銜'),
    '三': set('鍾支脂之微魚虞祭廢眞臻欣元文仙宵陽清蒸尤幽侵鹽嚴凡'),
    '四': set('齊先蕭青添'),
}

PATTERN_描述 = re.compile(f'([{所有母}])([開合])?([{所有等}])?([AB])?([{所有韻}])([{所有聲}])')


def 描述2編碼(描述: str) -> str:
    母, 呼, 等, 重紐, 韻, 聲 = PATTERN_描述.fullmatch(描述).groups()

    if not 呼 and 母 not in 脣音母:
        for k, v in 韻到呼.items():
            if 韻 in v:
                呼 = k
                break

    if not 等:
        for k, v in 韻到等.items():
            if 韻 in v:
                等 = k
                break
    # 資料均為可信任來源，省略驗證

    母編碼 = 所有母.index(母)
    韻編碼 = {'東三': 1, '歌三': 38, '麻三': 40, '庚三': 44}.get(f'{韻}{等}')
    if 韻編碼 is None:
        韻編碼 = 韻順序表.index(韻)

    有額外開合 = 呼 is not None and (母 in 脣音母 or 韻 in 開合中立韻)
    特殊重紐 = 韻 == '清' and 母 in 重紐母 if 重紐 is None else not (
        母 in 重紐母 and 韻 in v1重紐韻)

    其他編碼 = (int(有額外開合) << 5) + (int(特殊重紐) << 4) + \
        (int(呼 == '合') << 3) + (int(重紐 == 'B') << 2) + 所有聲.index(聲)

    return 編碼表[母編碼] + 編碼表[韻編碼] + 編碼表[其他編碼]


def fetch_data():
    if not os.path.exists('prepare/data.csv'):
        status = os.system(
            'curl -LsSo prepare/data.csv https://raw.githubusercontent.com/nk2028/qieyun-data/f42289f/%E9%9F%BB%E6%9B%B8/%E5%BB%A3%E9%9F%BB.csv')
        assert status == 0


# debug 用
def list_地位編碼():
    fetch_data()
    all_codes = {}
    with open('prepare/data.csv') as fin:
        for row in csv.DictReader(fin):
            描述 = row['最簡描述']
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
            _, 韻部原貌, 最簡描述, 反切覈校前, 反切, 字頭覈校前, 字頭, 釋義, 釋義補充, _ = row
            if 最簡描述 == '':
                continue
            反切 = 反切 or 反切覈校前 or '@@'  # placeholder
            字頭 = 字頭 or 字頭覈校前
            釋義 = 釋義 if not 釋義補充 else f'{釋義}（{釋義補充}）'
            編碼 = 描述2編碼(最簡描述)
            d.setdefault(編碼 + 反切, []).append((字頭, 韻部原貌, 釋義))

    os.makedirs('src/data', exist_ok=True)
    with open('src/data/資料.ts', 'w', newline='') as fout:
        print("export default '\\", file=fout)
        for 編碼反切, 條目 in d.items():
            print(編碼反切,
                  '|'.join(字頭 + 韻部原貌 + 釋義 for 字頭, 韻部原貌, 釋義 in 條目),
                  '\\', sep='', file=fout)
        print("';", file=fout)


if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'test':
        list_地位編碼()
    else:
        main()
