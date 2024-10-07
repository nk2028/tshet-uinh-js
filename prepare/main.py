#!/usr/bin/env python3

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
    if 韻 in tuple('東歌麻庚') and 等 not in tuple('一二'):
        韻序 += 1
    呼序 = 所有呼.index(呼) + 1 if 呼 else 0
    類序 = 所有類.index(類) + 1 if 類 else 0

    呼類聲序 = (呼序 << 4) | (類序 << 2) | 所有聲.index(聲)

    return 編碼表[母序] + 編碼表[韻序] + 編碼表[呼類聲序]


def fetch_data(
    commit: str = '1f1c085',
    md5sum: str = '92d1e840e7b118bc6b541c5aa5c9db8c',
):
    if not os.path.exists('prepare/data.csv'):
        status = os.system(
            f'curl -LsSo prepare/data.csv https://raw.githubusercontent.com/nk2028/tshet-uinh-data/{commit}/%E9%9F%BB%E6%9B%B8/%E5%BB%A3%E9%9F%BB.csv'
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

    韻目原貌by原書小韻: dict[int, str] = {}
    原書小韻音韻: dict[int, dict[str, tuple[str, str]]] = {}
    原書小韻內容: dict[int, list[tuple[str, str, str]]] = {}
    with open('prepare/data.csv') as fin:
        next(fin)
        max原書小韻號: int = 0
        cur音韻: dict[str, tuple[str, str]] = None
        cur內容: list[tuple[str, str, str]] = None
        for row in csv.reader(fin):
            (
                小韻號,
                _,
                韻目原貌,
                音韻地位描述,
                反切,
                字頭,
                釋義,
                釋義補充,
            ) = row

            if 小韻號[-1].isalpha():
                原書小韻號, 小韻細分 = int(小韻號[:-1]), 小韻號[-1]
            else:
                原書小韻號, 小韻細分 = int(小韻號), ''

            if 原書小韻號 != max原書小韻號:
                assert 原書小韻號 == max原書小韻號 + 1
                max原書小韻號 = 原書小韻號
                韻目原貌by原書小韻[原書小韻號] = 韻目原貌
                原書小韻音韻[原書小韻號] = cur音韻 = {}
                原書小韻內容[原書小韻號] = cur內容 = []

            assert 韻目原貌 == 韻目原貌by原書小韻[原書小韻號]

            音韻編碼 = 編碼_from_描述(音韻地位描述) if 音韻地位描述 else '@@@'
            if 小韻細分 in cur音韻:
                assert cur音韻[小韻細分] == (音韻編碼, 反切)
            else:
                cur音韻[小韻細分] = (音韻編碼, 反切)

            cur內容.append((字頭, 小韻細分, 釋義 + (釋義補充 and f'（{釋義補充}）')))

    for 原書小韻號, 各音韻信息 in 原書小韻音韻.items():
        各細分 = tuple(各音韻信息.keys())
        if len(各細分) == 1:
            assert 各細分[0] == ''
        else:
            assert 1 < len(各細分) <= 26
            assert 各細分 == tuple(chr(ord('a') + i) for i in range(len(各細分)))

    os.makedirs('src/data/raw', exist_ok=True)
    with open('src/data/raw/廣韻.txt', 'w', newline='') as fout:
        cur韻目 = None
        for 原書小韻號 in range(1, max原書小韻號 + 1):
            韻目 = 韻目原貌by原書小韻[原書小韻號]
            if 韻目 != cur韻目:
                print(f'#{韻目}', file=fout)
                cur韻目 = 韻目
            print(
                ''.join(
                    音韻編碼 + (反切 or '@@')
                    for 音韻編碼, 反切 in 原書小韻音韻[原書小韻號].values()
                ),
                '|'.join(
                    字頭 + 小韻細分 + 釋義
                    for 字頭, 小韻細分, 釋義 in 原書小韻內容[原書小韻號]
                ),
                sep='',
                file=fout,
            )


if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'test':
        list_地位編碼()
    else:
        main()
