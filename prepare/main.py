import csv
import hashlib
import os
import re
import sys

編碼表 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$_'

所有母 = '幫滂並明端透定泥來知徹澄孃精清從心邪莊初崇生俟章昌常書船日見溪羣疑影曉匣云以'
所有呼 = '開合'
所有等 = '一二三四'
所有類 = 'ABC'
所有韻 = '東冬鍾江支脂之微魚虞模齊祭泰佳皆夬灰咍廢真臻文殷元魂痕寒刪山先仙蕭宵肴豪歌麻陽唐庚耕清青蒸登尤侯幽侵覃談鹽添咸銜嚴凡'
所有聲 = '平上去入'

韻序表 = '東＊冬鍾江支脂之微魚虞模齊祭泰佳皆夬灰咍廢真臻文殷元魂痕寒刪山先仙蕭宵肴豪歌＊麻＊陽唐庚＊耕清青蒸登尤侯幽侵覃談鹽添咸銜嚴凡'

PATTERN_描述 = re.compile(
    f'([{所有母}])([{所有呼}])?([{所有等}])([{所有類}])?([{所有韻}])([{所有聲}])'
)


def 編碼_from_描述(描述: str) -> str:
    母, 呼, 等, 類, 韻, 聲 = PATTERN_描述.fullmatch(描述).groups()
    # 資料均為可信任來源，且均為完整描述，省略驗證與填充

    母序 = 所有母.index(母)
    韻序 = 韻序表.index(韻)
    if 等 == '三' and 韻 in list('東歌麻庚'):
        韻序 += 1
    呼序 = 所有呼.index(呼) + 1 if 呼 else 0
    類序 = 所有類.index(類) + 1 if 類 else 0

    呼類聲序 = (呼序 << 4) | (類序 << 2) | 所有聲.index(聲)

    return 編碼表[母序] + 編碼表[韻序] + 編碼表[呼類聲序]


def fetch_data(
    commit: str = 'afe65ed',
    md5sum: str = '1e08d0ee00f373d91e9b6abb6d755459',
):
    if not os.path.exists('prepare/data.csv'):
        status = os.system(
            f'curl -LsSo prepare/data.csv https://raw.githubusercontent.com/nk2028/qieyun-data/{commit}/%E9%9F%BB%E6%9B%B8/%E5%BB%A3%E9%9F%BB.csv'
        )
        assert status == 0, f'Error: curl exited with status code {status}'
    # NOTE `file_digest` requires Python 3.11+
    with open('prepare/data.csv', 'rb') as fin:
        digest = hashlib.file_digest(fin, 'md5')
        actual_checksum = digest.hexdigest()
    if md5sum == 'SKIP':
        print(f'MD5 checksum of data.csv (not checked): {actual_checksum}')
    else:
        md5sum = md5sum.lower()
        if md5sum != actual_checksum:
            print('Error: checksum failed for data.csv:')
            print(f'  Expected: {md5sum}')
            print(f'  Actual  : {actual_checksum}')
            exit(2)


# 偵錯用
def list_地位編碼():
    fetch_data()
    all_codes = {}
    with open('prepare/data.csv') as fin:
        for row in csv.DictReader(fin):
            描述 = row['音韻地位']
            if 描述 == '' or 描述 in all_codes:
                continue
            all_codes[描述] = 編碼_from_描述(描述)
    for 描述, 編碼 in sorted(all_codes.items(), key=lambda x: x[1]):
        print(編碼, 描述)


def main():
    fetch_data()

    d = {}
    with open('prepare/data.csv') as fin:
        next(fin)
        for row in csv.reader(fin):
            (_, _, 韻目原貌, 描述, 反切, 字頭, 字頭又作, 釋義, 釋義補充) = row
            if 描述 == '':
                continue
            反切 = 反切 or '@@'  # placeholder
            釋義 = 釋義 if not 釋義補充 else f'{釋義}（{釋義補充}）'
            編碼 = 編碼_from_描述(描述)
            d.setdefault(編碼 + 反切 + 韻目原貌, []).append((字頭, 字頭又作, 釋義))

    os.makedirs('src/data', exist_ok=True)
    with open('src/data/資料.ts', 'w', newline='') as fout:
        print('export default `\\', file=fout)
        for key, 各條目 in d.items():
            print(
                key,
                '|'.join(
                    字頭 + ''.join('+' + ch for ch in 字頭又作) + 釋義
                    for 字頭, 字頭又作, 釋義 in 各條目
                ),
                sep='',
                file=fout,
            )
        print('`;', file=fout)


if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'test':
        list_地位編碼()
    else:
        main()
