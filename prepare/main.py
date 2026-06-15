#!/usr/bin/env python3

import bisect
import csv
from dataclasses import dataclass
import hashlib
import os
from pathlib import Path
import re
import subprocess
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
    match = PATTERN_描述.fullmatch(描述)
    assert match is not None, 描述
    母, 呼, 等, 類, 韻, 聲 = match.groups()
    # 資料均為可信任來源，且均為完整描述，省略驗證與填充

    母序 = 所有母.index(母)
    韻序 = 韻序表.index(韻)
    if 韻 in tuple('東歌麻庚') and 等 not in tuple('一二'):
        韻序 += 1
    呼序 = 所有呼.index(呼) + 1 if 呼 else 0
    類序 = 所有類.index(類) + 1 if 類 else 0

    呼類聲序 = (呼序 << 4) | (類序 << 2) | 所有聲.index(聲)

    return 編碼表[母序] + 編碼表[韻序] + 編碼表[呼類聲序]


def fetch_file(name: str, url: str, md5sum: str | None) -> None:
    file_path = Path('prepare') / name
    if not file_path.exists():
        print(f'Fetching: {name}')
        # NOTE throws if failed, just let it
        subprocess.run(('curl', '-LsSo', str(file_path), url), check=True)
    with file_path.open('rb') as fin:
        digest = hashlib.file_digest(fin, 'md5')
        actual_checksum = digest.hexdigest()
    if md5sum is None:
        print(f'MD5 checksum of {name} (not checked): {actual_checksum}')
    else:
        md5sum = md5sum.lower()
        if md5sum != actual_checksum:
            print(f'Error: checksum failed for {name}:')
            print(f'  Expected: {md5sum}')
            print(f'  Actual  : {actual_checksum}')
            exit(2)


def fetch_tshet_uinh_data(
    commit: str = '21585e22c8a730ca2fd175112f4d18e16d5ce578',
    md5sum: str | None = '73fce617bc8c37932f277aa07d2e4bf2',
) -> None:
    fetch_file(
        'guangyun.csv',
        f'https://raw.githubusercontent.com/nk2028/tshet-uinh-data/{commit}/%E9%9F%BB%E6%9B%B8/%E5%BB%A3%E9%9F%BB.csv',
        md5sum,
    )


def fetch_qieyun_restored(
    commit: str = '6db59f89004ac747f5e6aa2d54e54bf6f6af2926',
    md5sum_fujita: str | None = 'b8906342df68aff7f9064e805d03fd3d',
    md5sum_small_rimes: str | None = '26308c665c2dcb2dfae74855eae23900',
    md5sum_correspondence: str | None = '7ee41ff1105c3257662a1cf511f3f189',
) -> None:
    for name, path, md5sum in (
        (
            'qieyun.csv',
            '%E5%88%87%E9%9F%BB%20%E8%97%A4%E7%94%B0%E6%8B%93%E6%B5%B7%E5%BE%A9%E5%85%83.csv',
            md5sum_fujita,
        ),
        (
            'qieyun_small_rimes.csv',
            'to_tshet_uinh_data/small_rimes.csv',
            md5sum_small_rimes,
        ),
        (
            'qieyun_correspondence.csv',
            'to_tshet_uinh_data/correspondence.csv',
            md5sum_correspondence,
        ),
    ):
        fetch_file(
            name,
            f'https://raw.githubusercontent.com/nk2028/qieyun-restored/{commit}/{path}',
            md5sum,
        )


# 偵錯用
def list_地位編碼() -> None:
    fetch_tshet_uinh_data()
    all_codes = {}
    with open('prepare/guangyun.csv') as fin:
        for row in csv.DictReader(fin):
            描述 = row['音韻地位']
            if 描述 in all_codes:
                continue
            all_codes[描述] = 編碼_from_描述(描述)
    for 描述, 編碼 in sorted(all_codes.items(), key=lambda x: x[1]):
        print(編碼, 描述)


@dataclass
class 條目Record:
    字頭: str
    字頭說明: str
    小韻細分: str
    釋義參照: str
    釋義: str

    def compact_string(self):
        說明 = f'【{self.字頭說明}】' if self.字頭說明 else ''
        參照 = {'': '', '上': '+', '下': '-'}[self.釋義參照]
        return f'{self.字頭}{說明}:{self.小韻細分}{參照}{self.釋義}'


def convert_廣韻() -> None:
    fetch_tshet_uinh_data()

    韻目原貌by原書小韻: dict[int, str] = {}
    原書小韻音韻: dict[int, dict[str, tuple[str, str, str]]] = {}
    原書小韻內容: dict[int, list[條目Record]] = {}
    with open('prepare/guangyun.csv') as fin:
        next(fin)
        max原書小韻號: int = 0
        cur音韻: dict[str, tuple[str, str, str]] = {}
        cur內容: list[條目Record] = []
        cur原書字號: int = 0
        cur增字號: int = 0
        for row in csv.reader(fin):
            (
                小韻號,
                小韻字號,
                韻目原貌,
                音韻地位描述,
                反切,
                直音,
                字頭,
                字頭說明,
                釋義,
                釋義參照,
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
                cur原書字號 = 0
                cur增字號 = 0

            if 字頭.startswith('［') and 字頭.endswith('］'):
                cur增字號 += 1
            else:
                cur原書字號 += 1
                cur增字號 = 0
            assert 小韻字號 == str(cur原書字號) + (f'a{cur增字號}' if cur增字號 else '')

            assert 韻目原貌 == 韻目原貌by原書小韻[原書小韻號]

            音韻編碼 = 編碼_from_描述(音韻地位描述)
            if 小韻細分 in cur音韻:
                assert cur音韻[小韻細分] == (音韻編碼, 反切, 直音)
            else:
                cur音韻[小韻細分] = (音韻編碼, 反切, 直音)

            cur內容.append(條目Record(字頭, 字頭說明, 小韻細分, 釋義參照, 釋義))

    for 原書小韻號, 各音韻信息 in 原書小韻音韻.items():
        各細分 = tuple(各音韻信息.keys())
        if len(各細分) == 1:
            assert 各細分[0] == ''
        else:
            assert 1 < len(各細分) <= 26
            assert 各細分 == tuple(chr(ord('a') + i) for i in range(len(各細分)))

    os.makedirs('src/data/raw', exist_ok=True)
    with open('src/data/raw/廣韻.ts', 'w', newline='') as fout:
        print('export default `\\', file=fout)
        cur韻目 = None
        for 原書小韻號 in range(1, max原書小韻號 + 1):
            韻目 = 韻目原貌by原書小韻[原書小韻號]
            if 韻目 != cur韻目:
                print(f'#{韻目}', file=fout)
                cur韻目 = 韻目
            print(
                '|'.join(
                    音韻編碼 + 反切 + (f'={直音}' if 直音 else '')
                    for 音韻編碼, 反切, 直音 in 原書小韻音韻[原書小韻號].values()
                ),
                ';',
                '|'.join(條目.compact_string() for 條目 in 原書小韻內容[原書小韻號]),
                sep='',
                file=fout,
            )
        print('` as string;', file=fout)


def convert_切韻() -> None:
    fetch_qieyun_restored()

    with open('prepare/qieyun_correspondence.csv') as fin:
        next(fin)
        對應廣韻小韻號by原訂小韻號: dict[str, str] = dict(
            line.rstrip().split(',') for line in fin
        )

    with open('prepare/qieyun_small_rimes.csv') as fin:
        rows = csv.DictReader(fin)
        小韻表 = list[dict[str, str]]()
        for row in rows:
            row['對應廣韻小韻號'] = 對應廣韻小韻號by原訂小韻號[row['小韻號']]
            小韻表.append(row)

    各小韻音韻 = list[list[dict[str, str]]]()
    各小韻內容 = list[list[dict[str, str]]]()
    當前小韻_key = ('', 0)
    with open('prepare/qieyun.csv') as fin:
        rows = csv.DictReader(fin)
        for row in rows:
            小韻_key = (row['韻目'], int(row['小韻']))
            if 小韻_key != 當前小韻_key:
                條目號 = int(row['序数'])
                pos = bisect.bisect(小韻表, 條目號, key=lambda x: int(x['藤田條目號']))
                assert pos > 0
                小韻音韻 = [小韻表[pos - 1]]
                # 細分小韻特別處理
                if 小韻音韻[0]['小韻號'][-1].isalpha():
                    assert 小韻_key == ('小', 15)
                    assert row['字頭'] == '鷕'
                    小韻音韻.append(小韻表[pos])
                各小韻音韻.append(小韻音韻)
                各小韻內容.append([])
                當前小韻_key = 小韻_key

            各小韻內容[-1].append(row)

    assert len(各小韻音韻) == len(各小韻內容)

    當前韻目 = ''
    os.makedirs('src/data/raw', exist_ok=True)
    with open('src/data/raw/切韻.ts', 'w', newline='') as fout:
        print('export default `\\', file=fout)
        for 小韻音韻, 小韻內容 in zip(各小韻音韻, 各小韻內容):
            韻目 = 小韻內容[0]['韻目']
            if 韻目 != 當前韻目:
                print(f'#{韻目}', file=fout)
                當前韻目 = 韻目

            音韻_output = []
            for 音韻 in 小韻音韻:
                編碼 = 編碼_from_描述(音韻['音韻地位'])
                對應廣韻小韻號 = 音韻['對應廣韻小韻號']
                反切 = 音韻['反切上字'] + 音韻['反切下字']
                直音 = re.sub(r'^無反語，取?(.*)$', r'\1', 音韻['直音'])
                音韻_output.append(
                    f'{編碼}{對應廣韻小韻號}{反切}{f"={直音}" if 直音 else ""}'
                )

            內容_output = []
            for i, 條目 in enumerate(小韻內容):
                字頭 = 條目['字頭']
                字頭或體 = next(
                    (
                        音韻['代表字']
                        for 音韻 in 小韻音韻
                        if 音韻['藤田條目號'] == 條目['序数']
                    ),
                    None,
                )
                if 字頭或體 == 字頭:
                    字頭或體 = None
                釋義 = 條目['釋義'].rstrip('.')
                if len(小韻音韻) > 1:
                    小韻細分 = 'a' if i == 0 else 'b'
                else:
                    小韻細分 = ''
                內容_output.append(
                    f'{字頭}{f"+{字頭或體}" if 字頭或體 else ""}:{小韻細分}{釋義}'
                )

            print('|'.join(音韻_output), '|'.join(內容_output), sep=';', file=fout)

        print('` as string;', file=fout)


def main() -> None:
    if len(sys.argv) == 2 and sys.argv[1] == 'test':
        list_地位編碼()
        return
    convert_廣韻()
    convert_切韻()


if __name__ == '__main__':
    main()
