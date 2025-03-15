import { readFileSync } from 'node:fs';

import test from 'ava';

import { 音韻地位 } from '../lib/音韻地位';

import { parse字頭詳情 } from './common';
import { iter音韻地位, query字頭, query音韻地位, 資料條目 } from './資料';

test('查「東」字的反切', t => {
  const 字頭 = '東';
  const res = query字頭(字頭);
  t.is(res.length, 1);
  t.is(res[0].反切, '德紅');
});

test('查「拯」字的音切，「拯」字有直音，無反切', t => {
  const 字頭 = '拯';
  const res = query字頭(字頭);
  t.is(res.length, 1);
  t.is(res[0].反切, null);
  t.is(res[0].直音, '蒸上聲');
  t.deepEqual(res[0].反切詳情(), []);
});

test('查同地位不同反切', t => {
  const 地位 = 音韻地位.from描述('見開四添去');
  const 條目 = query音韻地位(地位);
  t.is(條目.find(({ 字頭 }) => 字頭 === '趝')!.反切, '紀念');
  t.is(條目.find(({ 字頭 }) => 字頭 === '兼')!.反切, '古念');
});

test('查音韻地位「見合一歌平」，含「戈」、「過」等字', t => {
  const 當前音韻地位 = 音韻地位.from描述('見合一歌平'); // 注意：戈韻不獨立，屬歌韻
  t.true(query音韻地位(當前音韻地位).length > 0);
});

test('查音韻地位「從合三歌平」，有音無字', t => {
  const 當前音韻地位 = 音韻地位.from描述('從合三歌平');
  t.is(query音韻地位(當前音韻地位).length, 0);
});

test('查詢「之」字', t => {
  const res = query字頭('之');
  t.is(res.length, 1);
  t.is(res[0].字頭, '之');
  t.deepEqual(res[0].字頭詳情(), ['之']);
  t.is(res[0].音韻地位.描述, '章開三之平');
  t.is(res[0].釋義, '適也往也閒也亦姓出姓苑止而切四');
});

test('查詢「過」字。「過」字有兩讀', t => {
  const res = query字頭('過');
  t.is(res.length, 2);
});

test('查詢含校勘的字（應補、應刪）', t => {
  for (
    const [條目, 字頭, 詳情, 說明] of [
      [query字頭('𤜼')[0], '｛𤜼｝', ['𤜼', '｛｝'], '「犳」（章開三陽入）之訛字'],
      [query字頭('嬹').find(({ 音韻地位 }) => 音韻地位.聲 === '平'), '［嬹］', ['', '［嬹］'], null],
    ] as const
  ) {
    t.not(條目, undefined);
    t.is(條目!.字頭, 字頭);
    t.deepEqual(條目!.字頭詳情(), 詳情);
    t.is(條目!.字頭原貌(), 詳情[0] || null);
    t.is(條目!.字頭校正(), 詳情[1].slice(1, -1) || null);
    t.is(條目!.字頭說明, 說明);
  }
});

test('查詢含校勘的字（校）', t => {
  const res1 = query字頭('𢻹');
  const 條目1 = res1.find(({ 小韻號 }) => 小韻號 === '141');
  t.not(條目1, undefined);
  const res2 = query字頭('𤿎');
  const 條目2 = res2.find(({ 小韻號 }) => 小韻號 === '141');
  t.not(條目2, undefined);

  t.deepEqual(條目1, 條目2);
  t.is(條目1!.字頭, '𤿎〈𢻹〉');
  t.deepEqual(條目1!.字頭詳情(), ['𤿎', '〈𢻹〉']);
  t.is(條目1!.字頭原貌(), '𤿎');
  t.is(條目1!.字頭校正(), '𢻹');
});

test('.字頭詳情 與 .字頭 對應', t => {
  for (const 地位 of iter音韻地位()) {
    for (const 條目 of query音韻地位(地位)) {
      const 詳情 = 條目.字頭詳情();
      t.is((詳情[1] === '｛｝' ? [`｛${詳情[0]}｝`] : 詳情).join(''), 條目.字頭);
    }
  }
});

test('查詢含校勘的反切', t => {
  for (
    const [條目, 詳情, 原貌, 校正] of [
      [query字頭('淺').find(({ 音韻地位 }) => 音韻地位.聲 === '上')!, [['士', '〈七〉'], ['演']], '士演', '七演'],
      [query字頭('豆')[0], [['', '［徒］'], ['候']], '候', '徒候'],
      [query字頭('鷕')[0], [['以'], ['沼', '｟小｠', '〈水〉']], '以沼', '以水'],
      [query字頭('䅥').find(({ 音韻地位 }) => 音韻地位.等 === '三')!, [['居'], ['列', '（？）']], '居列', '居？'],
      [
        query字頭('𤜼')[0],
        [
          ['崇', '〈？〉'],
          ['玄', '〈？〉'],
        ],
        '崇玄',
        '？？',
      ],
    ] as const
  ) {
    t.deepEqual(條目.反切詳情(), 詳情);
    t.is(條目.反切原貌(), 原貌);
    t.is(條目.反切校正(), 校正);
  }
});

test('.反切詳情 與 .反切 內容對應', t => {
  for (const 地位 of iter音韻地位()) {
    for (const 條目 of query音韻地位(地位)) {
      t.is(
        條目
          .反切詳情()
          .flatMap(字詳情 => (字詳情[1] === '｛｝' ? [`｛${字詳情[0]}｝`] : 字詳情))
          .join(''),
        條目.反切 ?? '',
      );
    }
  }
});

test('.反切詳情 與 .反切原貌 內容對應', t => {
  for (const 地位 of iter音韻地位()) {
    for (const 條目 of query音韻地位(地位)) {
      t.is(
        條目
          .反切詳情()
          .map(x => x[0])
          .join('') || null,
        條目.反切原貌(),
      );
    }
  }
});

test('查詢資料不包含的字，沒有讀音', t => {
  const res = query字頭('韓'); // 《廣韻》字頭作「𩏑」，同時釋義注「亦作韓」
  t.is(res.length, 0);
});

test('查詢來源文獻信息', t => {
  t.like(
    query字頭('茝').find(({ 音韻地位 }) => 音韻地位.屬於('廢韻')),
    { 來源: '廣韻', 小韻號: '1454', 小韻字號: '1', 韻目: '海' },
  );
  t.like(
    query字頭('韻').find(({ 音韻地位 }) => 音韻地位.屬於('B類')),
    { 來源: '切韻', 韻目: '震' },
  );
  t.like(
    query字頭('忘').find(({ 音韻地位 }) => 音韻地位.屬於('去聲')),
    { 來源: '廣韻', 小韻號: '2914', 小韻字號: '4', 韻目: '漾' },
  );
  t.like(
    query字頭('忘').find(({ 音韻地位 }) => 音韻地位.屬於('平聲')),
    { 來源: '切韻', 韻目: '陽' },
  );
});

test('根據原資料檔查詢所有字頭', t => {
  for (const line of readFileSync('prepare/data.csv', { encoding: 'utf8' }).trimEnd().split('\n').slice(1)) {
    const [小韻號1, 小韻字號1, 韻目1, 地位描述, 反切1, 直音1, 字頭1, 字頭說明1, 釋義1] = line.split(',');
    const 音韻地位1 = 音韻地位.from描述(地位描述);

    function isEqual({ 來源, 小韻號, 小韻字號, 韻目, 音韻地位, 反切, 直音, 字頭, 字頭說明, 釋義 }: 資料條目) {
      return (
        來源 === '廣韻'
        && 小韻號 === 小韻號1
        && 小韻字號 === 小韻字號1
        && 韻目 === 韻目1
        && 音韻地位.等於(音韻地位1)
        && 反切 === (反切1 || null)
        && 直音 === (直音1 || null)
        && 字頭 === 字頭1
        && 字頭說明 === (字頭說明1 || null)
        && 釋義 === (釋義1 || null)
      );
    }

    const [字頭原貌, ...各校勘] = parse字頭詳情(字頭1);
    if (字頭原貌) {
      t.true(query字頭(字頭原貌).some(isEqual), `${字頭原貌}: ${line}`);
    }
    for (const 校勘 of 各校勘) {
      if (校勘 !== '｛｝') {
        t.true(query字頭(校勘.slice(1, -1)).some(isEqual), `${校勘}: ${line}`);
      }
    }
  }
});
